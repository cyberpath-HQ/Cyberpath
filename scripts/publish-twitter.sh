#!/bin/bash
# Script to post blog announcements to X (Twitter)

set -e

# Check required environment variables
if [ -z "$TWITTER_API_KEY" ] || [ -z "$TWITTER_API_SECRET" ] || [ -z "$TWITTER_ACCESS_TOKEN" ]; then
  echo "Error: Twitter API credentials not set"
  exit 1
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "No files to process"
  exit 0
fi

# Function to generate a viral tweet for a blog post
generate_tweet() {
  local title="$1"
  local description="$2"
  local url="$3"
  local tags="$4"
  local has_short_url="$5"
  
  # Extract key hashtags from tags (limit to 3 most relevant)
  local hashtags=""
  if [ -n "$tags" ] && echo "$tags" | jq empty 2>/dev/null; then
    # Convert tags to hashtags, limit to first 3, only strings
    hashtags=$(echo "$tags" | jq -r 'if type == "array" then .[:3] | map(select(type == "string") | "#" + (. | gsub(" "; "") | gsub("-"; ""))) | join(" ") else "" end')
  fi
  
  # Create an engaging tweet
  # Format: Hook + Title + hashtags + link
  # Twitter allows 280 characters, URLs always count as 23 chars
  
  # Calculate available space: 280 - 23 (URL) - newlines/spaces
  local available_chars=240
  
  # Start with hook
  local tweet_text="🚀 New on Cyberpath:"
  
  # Calculate remaining space for title
  local hashtag_length=${#hashtags}
  local title_max_length=$((available_chars - hashtag_length - 20))
  
  # Shorten title if needed
  local short_title="$title"
  if [ ${#title} -gt $title_max_length ]; then
    short_title="${title:0:$((title_max_length - 3))}..."
  fi
  
  # Build tweet
  tweet_text="$tweet_text

$short_title

$hashtags

$url"
  
  echo "$tweet_text"
}

# Read each changed file
echo "$CHANGED_FILES" | while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi
  
  echo "Processing: $file"
  
  # Process the blog post with remark plugins
  if ! PROCESSED=$(node scripts/process-blog-post.js "$file" twitter 2>&1); then
    echo "Failed to process $file: $PROCESSED"
    exit 1
  fi
  
  # Validate PROCESSED is valid JSON
  if ! echo "$PROCESSED" | jq empty 2>/dev/null; then
    echo "Invalid JSON output from process-blog-post.js: $PROCESSED"
    exit 1
  fi
  
  # Extract frontmatter
  TITLE=$(echo "$PROCESSED" | jq -r '.frontmatter.title')
  DESCRIPTION=$(echo "$PROCESSED" | jq -r '.frontmatter.description // ""')
  CANONICAL_URL=$(echo "$PROCESSED" | jq -r '.frontmatter.canonicalUrl')
  SHORT_URL=$(echo "$PROCESSED" | jq -r '.frontmatter.shortUrl // empty')
  TAG_ARRAY=$(echo "$PROCESSED" | jq -r '.frontmatter.tags // []')
  
  # Use short URL if available (for Twitter it should be)
  URL_TO_USE="${SHORT_URL:-$CANONICAL_URL}"
  HAS_SHORT_URL="false"
  if [ -n "$SHORT_URL" ]; then
    HAS_SHORT_URL="true"
    echo "Using short URL: $SHORT_URL"
  else
    echo "Warning: No short URL found, using full URL"
  fi
  
  # Generate tweet text
  TWEET_TEXT=$(generate_tweet "$TITLE" "$DESCRIPTION" "$URL_TO_USE" "$TAG_ARRAY" "$HAS_SHORT_URL")
  
  echo "Tweet to post:"
  echo "---"
  echo "$TWEET_TEXT"
  echo "---"
  
  # Export for Python
  export TWEET_TEXT
  
# Post to Twitter using requests
python3 - <<PYTHON_SCRIPT
import os
import sys
import time
try:
    import requests
except ImportError:
    print("Installing requests...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# Use OAuth 2.0 access token
access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
if not access_token:
    print("❌ TWITTER_ACCESS_TOKEN not set")
    sys.exit(1)

# Get tweet text from environment
tweet_text = os.environ.get('TWEET_TEXT')
if not tweet_text:
    print("❌ TWEET_TEXT not set")
    sys.exit(1)

# Post to Twitter API v2 with rate limiting
url = "https://api.x.com/2/tweets"
payload = {"text": tweet_text}
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

max_retries = 5
backoff = 10  # Start with 10 seconds (10, 20, 40, 80, 160)

for attempt in range(max_retries):
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Tweet posted successfully!")
            print(f"Tweet ID: {data['data']['id']}")
            print(f"URL: https://twitter.com/user/status/{data['data']['id']}")
            sys.exit(0)
        elif response.status_code == 429:
            if attempt < max_retries - 1:
                print(f"❌ Rate limited (429). Retrying in {backoff} seconds... (attempt {attempt + 1}/{max_retries})")
                time.sleep(backoff)
                backoff *= 2  # Exponential backoff
            else:
                print(f"❌ Error posting tweet: {response.status_code}")
                print(f"Response: {response.text}")
                sys.exit(1)
        else:
            print(f"❌ Error posting tweet: {response.status_code}")
            print(f"Response: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

print("❌ Max retries exceeded")
sys.exit(1)
PYTHON_SCRIPT
  
  if [ $? -ne 0 ]; then
    echo "Failed to post tweet"
    exit 1
  fi
  
done

echo "✅ Successfully posted to X (Twitter)"

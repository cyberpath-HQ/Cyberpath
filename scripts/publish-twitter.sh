#!/bin/bash
# Script to post blog announcements to X (Twitter)

set -e

# Check required environment variables
if [ -z "$TWITTER_API_KEY" ] || [ -z "$TWITTER_API_SECRET" ] || \
   [ -z "$TWITTER_ACCESS_TOKEN" ] || [ -z "$TWITTER_ACCESS_SECRET" ]; then
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
  if [ -n "$tags" ]; then
    # Convert tags to hashtags, limit to first 3
    hashtags=$(echo "$tags" | jq -r '.[:3] | map("#" + (. | gsub(" "; "") | gsub("-"; ""))) | join(" ")')
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
  PROCESSED=$(node scripts/process-blog-post.js "$file" twitter)
  
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
  
  # Post to Twitter using tweepy or similar
  # For now, we'll use a Python script with tweepy
  python3 - <<PYTHON_SCRIPT
import os
import sys
try:
    import tweepy
except ImportError:
    print("Installing tweepy...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tweepy"])
    import tweepy

# Authenticate to Twitter
auth = tweepy.OAuthHandler(
    os.environ['TWITTER_API_KEY'],
    os.environ['TWITTER_API_SECRET']
)
auth.set_access_token(
    os.environ['TWITTER_ACCESS_TOKEN'],
    os.environ['TWITTER_ACCESS_SECRET']
)

# Create API object
api = tweepy.API(auth)

# For API v2
client = tweepy.Client(
    consumer_key=os.environ['TWITTER_API_KEY'],
    consumer_secret=os.environ['TWITTER_API_SECRET'],
    access_token=os.environ['TWITTER_ACCESS_TOKEN'],
    access_token_secret=os.environ['TWITTER_ACCESS_SECRET']
)

# Post tweet
tweet_text = """$TWEET_TEXT"""

try:
    response = client.create_tweet(text=tweet_text)
    print(f"✅ Tweet posted successfully!")
    print(f"Tweet ID: {response.data['id']}")
    print(f"URL: https://twitter.com/user/status/{response.data['id']}")
except Exception as e:
    print(f"❌ Error posting tweet: {e}")
    sys.exit(1)
PYTHON_SCRIPT
  
  if [ $? -ne 0 ]; then
    echo "Failed to post tweet"
    exit 1
  fi
  
done

echo "✅ Successfully posted to X (Twitter)"

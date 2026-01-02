#!/bin/bash
# Script to publish blog posts to dev.to

set -e

# Function to retry API calls with rate limit handling
retry_api_call() {
  local url="$1"
  local method="${2:-GET}"
  local data="$3"
  local max_retries=5
  local retry=0
  local response

  while [ $retry -lt $max_retries ]; do
    if [ "$method" = "GET" ]; then
      response=$(curl -s -X GET "$url" -H "api-key: $DEVTO_API_KEY")
    elif [ "$method" = "POST" ]; then
      response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -H "api-key: $DEVTO_API_KEY" -d "$data")
    elif [ "$method" = "PUT" ]; then
      response=$(curl -s -X PUT "$url" -H "Content-Type: application/json" -H "api-key: $DEVTO_API_KEY" -d "$data")
    fi

    # Check if rate limited
    if echo "$response" | jq -e '.status == 429' >/dev/null 2>&1; then
      local wait_time=$(echo "$response" | jq -r '.error | capture("try again in (?<seconds>[0-9]+) seconds").seconds // "30"')
      echo "Rate limit reached, waiting $wait_time seconds before retry..."
      sleep "$wait_time"
      ((retry++))
    else
      echo "$response"
      return 0
    fi
  done

  echo "Max retries exceeded for $url"
  return 1
}

# Check required environment variables
if [ -z "$DEVTO_API_KEY" ]; then
  echo "Error: DEVTO_API_KEY is not set"
  exit 1
fi

if [ -z "$CHANGED_FILES" ]; then
  echo "No files to process"
  exit 0
fi

PUBLISH_MODE="${PUBLISH_MODE:-draft}"
ORGANIZATION_ID="${ORGANIZATION_ID:-}"

# Read each changed file
echo "$CHANGED_FILES" | while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi
  
  echo "Processing: $file"
  
  # Process the blog post with remark plugins
  PROCESSED=$(node scripts/process-blog-post.js "$file" devto)
  
  # Validate PROCESSED is valid JSON
  if ! echo "$PROCESSED" | jq empty 2>/dev/null; then
    echo "Invalid JSON output from process-blog-post.js: $PROCESSED"
    exit 1
  fi
  
  # Extract frontmatter and content
  TITLE=$(echo "$PROCESSED" | jq -r '.frontmatter.title')
  DESCRIPTION=$(echo "$PROCESSED" | jq -r '.frontmatter.description // ""')
  CANONICAL_URL=$(echo "$PROCESSED" | jq -r '.frontmatter.canonicalUrl')
  CONTENT=$(echo "$PROCESSED" | jq -r '.content')
  SLUG=$(echo "$PROCESSED" | jq -r '.frontmatter.slug')
  HERO_IMAGE=$(echo "$PROCESSED" | jq -r '.frontmatter.heroImage // ""')
  
  # Determine main image URL if hero image exists
  MAIN_IMAGE_URL=""
  if [ -n "$HERO_IMAGE" ]; then
    # Extract site base URL from canonical URL
    SITE_URL=$(echo "$CANONICAL_URL" | sed 's|/blog/.*||')
    # Construct public image URL using the post slug
    MAIN_IMAGE_URL="$SITE_URL/images/$SLUG.webp"
    echo "Using main image: $MAIN_IMAGE_URL"
  fi
  TAG_ARRAY=$(echo "$PROCESSED" | jq -r '.frontmatter.tags // [] | .[0:4] | @json')
  
  # Add canonical URL notice at the top of the content
  FULL_CONTENT="*Originally published at [Cyberpath]($CANONICAL_URL)*

---

$CONTENT"
  
  # Check if article already exists on dev.to
  ARTICLE_ID=""
  ARTICLES_RESPONSE=$(retry_api_call "https://dev.to/api/articles/me/all")
  
  if echo "$ARTICLES_RESPONSE" | jq empty 2>/dev/null; then
    EXISTING=$(echo "$ARTICLES_RESPONSE" | \
      jq -r --arg slug "$SLUG" '.[] | select(.slug | contains($slug)) | .id' | head -1)
  else
    echo "Invalid JSON response from dev.to articles API: $ARTICLES_RESPONSE"
    exit 1
  fi
  
  if [ -n "$EXISTING" ]; then
    echo "Updating existing article ID: $EXISTING"
    ARTICLE_ID="$EXISTING"
  fi
  
  # Prepare JSON payload
  if [ -n "$ARTICLE_ID" ]; then
    # Update existing article
    PAYLOAD=$(jq -n \
      --arg title "$TITLE" \
      --arg body "$FULL_CONTENT" \
      --argjson tags "$TAG_ARRAY" \
      --arg canonical "$CANONICAL_URL" \
      --arg published "$([[ $PUBLISH_MODE == 'published' ]] && echo 'true' || echo 'false')" \
      --arg description "$DESCRIPTION" \
      '{
        article: {
          title: $title,
          body_markdown: $body,
          published: ($published == "true"),
          tags: $tags,
          canonical_url: $canonical,
          description: $description,
          series: "Cyberpath Blog"
        }
      }')
    
    if [ -n "$MAIN_IMAGE_URL" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg image "$MAIN_IMAGE_URL" '.article.main_image = $image')
    fi
    
    if [ -n "$ORGANIZATION_ID" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg org "$ORGANIZATION_ID" '.article.organization_id = $org')
    fi
    
    RESPONSE=$(retry_api_call "https://dev.to/api/articles/$ARTICLE_ID" "PUT" "$PAYLOAD")
    
    echo "Updated article: $(echo "$RESPONSE" | jq -r '.url // "Error"')"
  else
    # Create new article
    PAYLOAD=$(jq -n \
      --arg title "$TITLE" \
      --arg body "$FULL_CONTENT" \
      --argjson tags "$TAG_ARRAY" \
      --arg canonical "$CANONICAL_URL" \
      --arg published "$([[ $PUBLISH_MODE == 'published' ]] && echo 'true' || echo 'false')" \
      --arg description "$DESCRIPTION" \
      '{
        article: {
          title: $title,
          body_markdown: $body,
          published: ($published == "true"),
          tags: $tags,
          canonical_url: $canonical,
          description: $description,
          series: "Cyberpath Blog"
        }
      }')
    
    if [ -n "$MAIN_IMAGE_URL" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg image "$MAIN_IMAGE_URL" '.article.main_image = $image')
    fi
    
    if [ -n "$ORGANIZATION_ID" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg org "$ORGANIZATION_ID" '.article.organization_id = $org')
    fi
    
    RESPONSE=$(retry_api_call "https://dev.to/api/articles" "POST" "$PAYLOAD")
    
    echo "Created article: $(echo "$RESPONSE" | jq -r '.url // "Error"')"
  fi
  
  # Check for errors
  if echo "$RESPONSE" | jq empty 2>/dev/null; then
    ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')
    if [ -n "$ERROR" ]; then
      echo "Error: $ERROR"
      echo "Full response: $RESPONSE"
      exit 1
    fi
  else
    echo "Invalid JSON response from dev.to API: $RESPONSE"
    exit 1
  fi
  
done

echo "✅ Successfully published/updated posts to dev.to"

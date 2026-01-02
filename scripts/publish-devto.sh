#!/bin/bash
# Script to publish blog posts to dev.to

set -e

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
  
  # Upload cover image if hero image exists
  COVER_URL=""
  if [ -n "$HERO_IMAGE" ]; then
    DIR=$(dirname "$file")
    HERO_PATH=$(realpath "$DIR/$HERO_IMAGE" 2>/dev/null || echo "")
    if [ -f "$HERO_PATH" ]; then
      echo "Uploading cover image: $HERO_PATH"
      IMAGE_RESPONSE=$(curl -s -X POST "https://dev.to/api/images" \
        -H "api-key: $DEVTO_API_KEY" \
        -F "image=@$HERO_PATH")
      
      if echo "$IMAGE_RESPONSE" | jq empty 2>/dev/null; then
        COVER_URL=$(echo "$IMAGE_RESPONSE" | jq -r '.url // ""')
        if [ -n "$COVER_URL" ]; then
          echo "Cover image uploaded: $COVER_URL"
        else
          echo "Failed to upload cover image: no URL in response"
        fi
      else
        echo "Invalid JSON response from dev.to images API: $IMAGE_RESPONSE"
      fi
    else
      echo "Hero image not found: $HERO_PATH"
    fi
  fi
  TAG_ARRAY=$(echo "$PROCESSED" | jq -r '.frontmatter.tags // [] | .[0:4] | @json')
  
  # Add canonical URL notice at the top of the content
  FULL_CONTENT="*Originally published at [Cyberpath]($CANONICAL_URL)*

---

$CONTENT"
  
  # Check if article already exists on dev.to
  ARTICLE_ID=""
  ARTICLES_RESPONSE=$(curl -s -X GET "https://dev.to/api/articles/me/all" \
    -H "api-key: $DEVTO_API_KEY")
  
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
    
    if [ -n "$COVER_URL" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg cover "$COVER_URL" '.article.cover_image = $cover')
    fi
    
    if [ -n "$ORGANIZATION_ID" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg org "$ORGANIZATION_ID" '.article.organization_id = $org')
    fi
    
    RESPONSE=$(curl -s -X PUT "https://dev.to/api/articles/$ARTICLE_ID" \
      -H "Content-Type: application/json" \
      -H "api-key: $DEVTO_API_KEY" \
      -d "$PAYLOAD")
    
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
    
    if [ -n "$COVER_URL" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg cover "$COVER_URL" '.article.cover_image = $cover')
    fi
    
    if [ -n "$ORGANIZATION_ID" ]; then
      PAYLOAD=$(echo "$PAYLOAD" | jq --arg org "$ORGANIZATION_ID" '.article.organization_id = $org')
    fi
    
    RESPONSE=$(curl -s -X POST "https://dev.to/api/articles" \
      -H "Content-Type: application/json" \
      -H "api-key: $DEVTO_API_KEY" \
      -d "$PAYLOAD")
    
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

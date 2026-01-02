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
      COVER_URL=$(curl -s -X POST "https://dev.to/api/images" \
        -H "api-key: $DEVTO_API_KEY" \
        -F "image=@$HERO_PATH" | jq -r '.url // ""')
      if [ -n "$COVER_URL" ]; then
        echo "Cover image uploaded: $COVER_URL"
      else
        echo "Failed to upload cover image"
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
  EXISTING=$(curl -s -X GET "https://dev.to/api/articles/me/all" \
    -H "api-key: $DEVTO_API_KEY" | \
    jq -r --arg slug "$SLUG" '.[] | select(.slug | contains($slug)) | .id' | head -1)
  
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
      --arg cover "$COVER_URL" \
      --arg org "$ORGANIZATION_ID" \
      '{
        article: {
          title: $title,
          body_markdown: $body,
          published: ($published == "true"),
          tags: $tags,
          canonical_url: $canonical,
          description: $description,
          series: "Cyberpath Blog"
        } + if $cover != "" then {cover_image: $cover} else {} end + if $org != "" then {organization_id: $org} else {} end
      }')
    
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
      --arg cover "$COVER_URL" \
      --arg org "$ORGANIZATION_ID" \
      '{
        article: {
          title: $title,
          body_markdown: $body,
          published: ($published == "true"),
          tags: $tags,
          canonical_url: $canonical,
          description: $description,
          series: "Cyberpath Blog"
        } + if $cover != "" then {cover_image: $cover} else {} end + if $org != "" then {organization_id: $org} else {} end
      }')
    
    RESPONSE=$(curl -s -X POST "https://dev.to/api/articles" \
      -H "Content-Type: application/json" \
      -H "api-key: $DEVTO_API_KEY" \
      -d "$PAYLOAD")
    
    echo "Created article: $(echo "$RESPONSE" | jq -r '.url // "Error"')"
  fi
  
  # Check for errors
  ERROR=$(echo "$RESPONSE" | jq -r '.error // empty')
  if [ -n "$ERROR" ]; then
    echo "Error: $ERROR"
    echo "Full response: $RESPONSE"
    exit 1
  fi
  
done

echo "✅ Successfully published/updated posts to dev.to"

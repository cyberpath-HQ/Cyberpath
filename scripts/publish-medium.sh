#!/bin/bash
# Script to generate Medium import URLs for blog posts
# 
# Medium no longer provides API tokens for new users.
# Instead, this script generates import URLs that can be used
# to import content directly into Medium via their web interface.

set -e

if [ -z "$CHANGED_FILES" ]; then
  echo "No files to process"
  exit 0
fi

echo "📝 Generating Medium import URLs..."
echo ""
echo "Medium Import Guide:"
echo "===================="
echo ""
echo "Medium no longer allows API token generation for new users."
echo "Instead, you can import posts using their web interface:"
echo ""

# Read each changed file
echo "$CHANGED_FILES" | while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi
  
  echo "Processing: $file"
  
  # Process the blog post with remark plugins
  PROCESSED=$(node scripts/process-blog-post.js "$file" medium)
  
  # Extract frontmatter
  TITLE=$(echo "$PROCESSED" | jq -r '.frontmatter.title')
  ORIGINAL_URL=$(echo "$PROCESSED" | jq -r '.frontmatter.originalUrl')
  SLUG=$(echo "$PROCESSED" | jq -r '.frontmatter.slug')
  MEDIUM_PUBLICATION=$(echo "$PROCESSED" | jq -r '.frontmatter.mediumPublication // empty')
  
  # Generate import URL
  IMPORT_URL="https://medium.com/p/import?url=${ORIGINAL_URL}"
  
  echo ""
  echo "📄 Post: $TITLE"
  echo "   Slug: $SLUG"
  if [ -n "$MEDIUM_PUBLICATION" ]; then
    echo "   📚 Publication: $MEDIUM_PUBLICATION"
    echo "   ⚠️  Remember to submit to publication after importing!"
  fi
  echo "   🔗 Import URL: $IMPORT_URL"
  echo ""
  echo "   Steps to import:"
  echo "   1. Open: $IMPORT_URL"
  echo "   2. Medium will preview the imported content"
  echo "   3. Click 'Import' to create the draft"
  if [ -n "$MEDIUM_PUBLICATION" ]; then
    echo "   4. After importing, submit to '$MEDIUM_PUBLICATION' publication"
  fi
  echo "   ---"
  echo ""
  
done

echo ""
echo "✅ Import URLs generated successfully"
echo ""
echo "💡 Tips:"
echo "   - Import URLs can be bookmarked for batch importing"
echo "   - Medium will automatically detect the canonical URL"
echo "   - You can edit the post after importing before publishing"
echo "   - To publish to a publication, import first then submit"

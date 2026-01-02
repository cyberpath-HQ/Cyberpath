#!/bin/bash
# Setup script: Configure Git to use custom hooks directory
# Run this once after cloning the repository

set -e

echo "🔧 Setting up Git hooks..."

# Configure Git to use .githooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured!"
echo ""
echo "The following hooks are now active:"
echo "  - pre-commit: Generates and validates post aliases"
echo "  - pre-push: Validates aliases across all commits being pushed"
echo ""
echo "To allow alias mutations in a commit, add [allow-alias-mutation] to the commit message:"
echo "  git commit -m \"Update post aliases [allow-alias-mutation]\""

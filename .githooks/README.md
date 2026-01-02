# Git Hooks Quick Reference

This repository uses Git hooks to automate alias management for short URLs.

## Setup (One-Time)

```bash
./scripts/setup-hooks.sh
```

## Pre-Commit Hook

Runs automatically on every `git commit`:

- ✅ Generates aliases for new/modified posts
- ✅ Removes aliases for deleted posts
- ✅ Validates alias uniqueness
- ✅ Auto-stages `post-aliases.json`
- ❌ Blocks mutations without explicit permission

### Normal Commit

```bash
git add src/content/blog/my-new-post.mdx
git commit -m "Add new blog post"
# Hook runs automatically, generates alias if needed
```

### Allow Alias Mutations

When you need to change slugs or regenerate aliases:

```bash
git commit -m "Update post slugs [allow-alias-mutation]"
```

The `[allow-alias-mutation]` flag tells the hook to allow existing aliases to be changed.

## Pre-Push Hook

Runs automatically on every `git push`:

- ✅ Validates **each commit** being pushed
- ✅ Checks for alias mutations per commit
- ✅ Ensures `[allow-alias-mutation]` flag is present if needed
- ❌ Blocks push if any commit has unauthorized mutations

### Example Output

```bash
$ git push origin master
🔍 Pre-push: Validating post aliases across commits...
📋 Checking 2 commit(s)...

  Checking a1b2c3d: Add new security post
    ✅ No alias changes

  Checking e4f5g6h: Update frontmatter
    → Alias file modified
    ✅ No mutations detected

✅ Pre-push validation passed
```

### Mutation Detection

If a commit changes an existing alias:

```bash
$ git push origin master
🔍 Pre-push: Validating post aliases across commits...
📋 Checking 1 commit(s)...

  Checking e4f5g6h: Update post slugs
    → Alias file modified
    ❌ Alias mutations detected in commit e4f5g6h:
      - advanced-threat-hunting: x3k9a → y4j8b

    Alias mutations break existing short URLs.
    To allow mutations, amend the commit message:
    git commit --amend -m "Your message [allow-alias-mutation]"
```

### Fix Mutations

```bash
# Amend the last commit to add the flag
git commit --amend -m "Update post slugs [allow-alias-mutation]"

# Or amend without changing the message
git commit --amend -m "$(git log -1 --pretty=%B) [allow-alias-mutation]"

# Then push again
git push origin master
```

## Bypassing Hooks

⚠️ **Not recommended** - disables all safety checks:

```bash
# Skip pre-commit
git commit --no-verify -m "Emergency fix"

# Skip pre-push
git push --no-verify
```

Only use `--no-verify` for emergency situations where the hooks are blocking critical fixes.

## Manual Operations

You can run alias operations manually:

```bash
# Generate aliases for all posts
node scripts/generate-aliases.js generate

# Allow mutations manually
node scripts/generate-aliases.js generate --allow-mutations

# Validate existing aliases
node scripts/generate-aliases.js validate

# Get alias for specific post
node scripts/generate-aliases.js get my-post-slug
```

## Common Workflows

### Adding a New Post

```bash
# 1. Create your post
vim src/content/blog/my-new-post.mdx

# 2. Commit (hook auto-generates alias)
git add src/content/blog/my-new-post.mdx
git commit -m "Add post about security"

# 3. Push (hook validates)
git push origin master
```

The hook automatically:

- Generates a 5-character alias
- Adds it to `post-aliases.json`
- Stages the file in your commit

### Deleting a Post

```bash
# 1. Delete the post
git rm src/content/blog/old-post.mdx

# 2. Commit (hook auto-removes alias)
git commit -m "Remove outdated post"

# 3. Push (hook validates)
git push origin master
```

The hook automatically removes the alias from `post-aliases.json`.

### Changing Post Slugs (Rare)

```bash
# 1. Rename the file
git mv src/content/blog/old-slug.mdx src/content/blog/new-slug.mdx

# 2. Commit with mutation flag
git commit -m "Rename post for better SEO [allow-alias-mutation]"

# 3. Push
git push origin master
```

⚠️ This breaks existing short URLs! Only do this if absolutely necessary.

## Hook Files

- `.githooks/pre-commit` - Pre-commit hook script
- `.githooks/pre-push` - Pre-push hook script
- `scripts/setup-hooks.sh` - Setup script to activate hooks
- `scripts/generate-aliases.js` - Alias generation and validation

## Troubleshooting

**Hooks not running?**

```bash
# Check Git config
git config core.hooksPath
# Should return: .githooks

# Re-run setup if needed
./scripts/setup-hooks.sh
```

**Need to temporarily disable?**

```bash
# Disable hooks
git config core.hooksPath ""

# Re-enable later
git config core.hooksPath .githooks
```

**Hook errors?**

```bash
# Test alias generation manually
node scripts/generate-aliases.js generate

# Check for syntax errors
node --check scripts/generate-aliases.js
```

## Why This Matters

Short URLs (like `cyberpath-hq.com/p/a3x9k`) are shared on Twitter and other platforms. If the alias changes:

- ❌ Shared links break
- ❌ Users get 404 errors
- ❌ Lost traffic and poor UX

The Git hooks protect against accidental mutations, ensuring short URLs remain stable while still allowing intentional
changes when needed.

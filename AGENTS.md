# AGENTS.md - Development Guidelines for CyberPath

This file contains guidelines for agentic coding agents working on the CyberPath project - a static cybersecurity blog platform built with Astro, React, and TypeScript.

## Build & Development Commands

### Core Commands
```bash
# Start development server
pnpm dev

# Build for production (includes type checking, browser install, build, and screenshots)
pnpm build

# Preview production build
pnpm preview

# Type checking only
npx astro check

# Linting (if available)
npx eslint . --ext .ts,.tsx,.astro
```

### Testing
This project does not have formal unit tests. Testing is done through:
- TypeScript compilation for type safety
- Manual testing via `pnpm dev`
- Build validation via `pnpm build`

## Project Architecture

### Technology Stack
- **Framework**: Astro 5.16.6 (static site generator)
- **UI**: React 18.3.1 with Astro integration
- **Styling**: Tailwind CSS 4.1.18
- **Components**: shadcn/ui + Radix UI primitives
- **Language**: TypeScript (strict mode)
- **Content**: MDX with remark/rehype plugins
- **Package Manager**: pnpm

### Directory Structure
```
src/
├── assets/          # Static assets (images, avatars)
├── components/      # Reusable components
│   ├── astro/      # Astro-specific components
│   ├── react/      # React components  
│   ├── ui/         # shadcn/ui components
│   └── icon/       # Icon components
├── content/        # Content collections (blog, certifications)
├── data/           # Data files and utilities
├── layouts/        # Astro layout components
├── lib/            # Utility libraries
├── pages/          # Route-based pages
├── styles/         # Global styles
└── types/          # TypeScript type definitions
```

## Code Style Guidelines

### Import Patterns
```typescript
// External imports first
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// Then internal aliases
import { SearchableBlogPost } from '@/types/search';
import { createSearchablePost } from '@/lib/search-utils';
```

**Path Aliases** (always use these):
- `@/*` → `./src/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`

### Naming Conventions

**Files**:
- Astro components: kebab-case (`header.astro`, `blog-list.astro`)
- React components: PascalCase (`Button.tsx`, `SearchBar.tsx`)
- Utilities: kebab-case (`search-utils.ts`, `categories.ts`)
- Pages: kebab-case with brackets for dynamic routes (`[slug].astro`)

**Code**:
- Variables/Functions: camelCase (`category`, `readingTime`, `createSearchablePost`)
- Constants: UPPER_SNAKE_CASE (`ALL_CATEGORIES`, `FUSE_OPTIONS`)
- Types/Interfaces: PascalCase (`SearchableBlogPost`, `CollectionEntry`)

### Component Patterns

**React Components**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick?: () => void;
}

export function Button({ children, variant = 'default', onClick }: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**Astro Components**:
```astro
---
import { Header } from '@components/astro/header.astro';
import { Footer } from '@components/astro/footer.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---
<html lang="en">
  <head>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
  </body>
</html>
```

### Error Handling

**Validation Errors**:
```typescript
if (!post.data.category) {
  throw new Error(`Missing category in blog post "${post.id}"`);
}

if (!ALL_CATEGORIES.includes(post.data.category as any)) {
  throw new Error(`Invalid category "${post.data.category}" in blog post "${post.id}"`);
}
```

**Async Operations**:
```typescript
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
```

**Component Error Boundaries**:
```typescript
const handleError = useCallback((): void => {
  setError(true);
}, []);
```

### TypeScript Guidelines

**Type Imports**:
```typescript
import type { CollectionEntry } from 'astro:content';
import type { SearchableBlogPost } from '@/types/search';
```

**Strict Typing**:
- Always provide explicit types for function parameters and return values
- Use interfaces for object shapes
- Prefer `const` assertions for literal types
- Use generic types where appropriate

**Content Collections**:
```typescript
export type BlogPost = CollectionEntry<'blog'>;
export type CertificationPost = CollectionEntry<'certifications'>;
```

## Content Management

### Blog Posts
- Location: `src/content/blog/`
- Format: MDX with frontmatter
- Required fields: `title`, `description`, `pubDate`, `category`, `author`
- Optional fields: `heroImage`, `tags`, `draft`

### Categories
Use predefined categories from `@/data/categories.ts`:
```typescript
export const ALL_CATEGORIES = [
  'network-security',
  'web-security', 
  'cryptography',
  'malware-analysis',
  'digital-forensics',
  'ethical-hacking',
  'compliance',
  'tools'
] as const;
```

## Development Workflow

### Before Committing
1. Run `npx astro check` for type validation
2. Run `pnpm build` to ensure production build works
3. Test changes manually via `pnpm dev`

### Performance Considerations
- Images are optimized automatically during build
- Critical CSS is inlined
- Use Astro islands for interactive components
- Leverage static generation where possible

### SEO Best Practices
- All pages should have proper meta tags
- Use structured data for blog posts
- Implement proper heading hierarchy
- Ensure accessibility with ARIA labels

## Common Patterns

### Search Implementation
Use the precomputed search index from `@/lib/search.ts`:
```typescript
import { searchPosts } from '@/lib/search';

const results = searchPosts(query, {
  threshold: 0.3,
  keys: ['title', 'description', 'content']
});
```

### Date Formatting
```typescript
import { format } from 'date-fns';

const formattedDate = format(new Date(post.data.pubDate), 'MMM dd, yyyy');
```

### Reading Time Calculation
```typescript
const readingTime = Math.ceil(content.split(' ').length / 200);
```

## Build Process Notes

The build process includes several automated steps:
1. TypeScript validation (`astro check`)
2. Puppeteer browser installation for screenshots
3. Astro build with optimization
4. Screenshot generation for social media
5. Dev toolbar disabling for production

Always test the full build process before submitting changes.
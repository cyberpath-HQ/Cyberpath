# Cyberpath Blog

A modern, SEO-optimized blog built with Astro, Tailwind CSS, and shadcn/ui components.

## Features

### ✨ Modern Design
- **Responsive Layout** - Optimized for mobile, tablet, and desktop
- **shadcn/ui Components** - Beautiful, accessible UI components
- **Dark Mode Support** - Automatic theme switching with Tailwind CSS
- **Clean Typography** - Enhanced prose styling with @tailwindcss/typography

### 📝 Content Features
- **MDX Support** - Write content with Markdown or MDX (JSX in Markdown)
- **Syntax Highlighting** - Beautiful code blocks with rehype-pretty-code
- **Mermaid Diagrams** - Embed flowcharts, sequence diagrams, and more
- **Image Optimization** - Automatic image optimization with Astro's Image component
- **Author Profiles** - Rich author information with social links and bios

### 🔍 SEO Optimized
- **Meta Tags** - Comprehensive meta tags for search engines
- **Open Graph** - Rich social media previews
- **Twitter Cards** - Beautiful previews on Twitter
- **Structured Data** - JSON-LD for better search engine understanding
- **Sitemap Generation** - Automatic sitemap for search engines

### ⚡ Performance
- **Static Site Generation** - All pages pre-rendered at build time
- **Optimized Assets** - Minified CSS and JS
- **Lazy Loading** - Images loaded on-demand
- **Fast Navigation** - Client-side routing with Astro

## Blog Structure

```
src/
├── content/
│   └── blog/                          # Blog posts
│       ├── post-1.mdx
│       └── post-2.mdx
├── layouts/
│   └── BlogPost.astro                 # Blog post layout
├── pages/
│   └── blog/
│       ├── index.astro                # Blog listing page
│       └── [slug].astro               # Dynamic blog post route
└── styles/
    └── globals.css                    # Global styles + shadcn variables
```

## Writing a Blog Post

### 1. Create a New File

Create a new `.mdx` file in `src/content/blog/`:

```bash
touch src/content/blog/my-awesome-post.mdx
```

### 2. Add Frontmatter

Every blog post requires frontmatter with metadata:

```mdx
---
title: "Your Post Title"
description: "A brief description of your post"
pubDate: 2024-01-15
updatedDate: 2024-01-20  # Optional
heroImage: https://example.com/image.jpg  # Optional
tags: ["tag1", "tag2", "tag3"]
author:
  name: "Your Name"
  bio: "A short bio about yourself"  # Optional
  avatar: ./path/to/avatar.jpg  # Optional
  twitter: "@yourhandle"  # Optional
  github: "yourusername"  # Optional
  linkedin: "https://linkedin.com/in/you"  # Optional
  website: "https://yourwebsite.com"  # Optional
readingTime: "5 min read"  # Optional
draft: false  # Set to true to hide from production
---

Your content goes here...
```

### 3. Write Content

Use standard Markdown or MDX syntax:

#### Basic Markdown

```markdown
## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2

1. Numbered item
2. Another item

[Link text](https://example.com)

> Blockquote

`inline code`
```

#### Code Blocks

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

#### Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

#### Using shadcn Components

Import and use shadcn components directly in MDX:

```mdx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card>
  <CardHeader>
    <CardTitle>Important Note</CardTitle>
  </CardHeader>
  <CardContent>
    This is a beautiful card component!
  </CardContent>
</Card>

<Badge>New Feature</Badge>
```

## Available shadcn Components

The following shadcn/ui components are installed and ready to use:

- `Button` - Buttons with variants
- `Card` - Card container with header, content, and footer
- `Badge` - Labels and tags
- `Avatar` - User avatars with fallback
- `Separator` - Visual dividers

### Adding More Components

To add more shadcn/ui components:

```bash
pnpm dlx shadcn@latest add [component-name]
```

For example:

```bash
pnpm dlx shadcn@latest add alert dialog tabs
```

Browse all available components at [ui.shadcn.com](https://ui.shadcn.com/docs/components).

## Styling Guide

### Prose Classes

Blog content automatically uses the `prose` class from @tailwindcss/typography. Customize prose styling in the BlogPost layout:

```astro
<div class="prose prose-slate dark:prose-invert prose-lg">
  <Content />
</div>
```

### Custom CSS Variables

shadcn/ui uses CSS variables for theming. All variables are defined in `src/styles/globals.css`:

- `--background` - Page background
- `--foreground` - Text color
- `--primary` - Primary brand color
- `--secondary` - Secondary color
- `--muted` - Muted backgrounds
- `--accent` - Accent color
- `--destructive` - Error/warning color
- `--border` - Border color
- `--ring` - Focus ring color

## SEO Best Practices

### Required Frontmatter Fields

For optimal SEO, include:

1. **title** - Descriptive, keyword-rich title (50-60 characters)
2. **description** - Compelling summary (150-160 characters)
3. **heroImage** - High-quality image (1200x630px recommended)
4. **tags** - Relevant keywords for categorization

### Image Optimization

Use Astro's Image component for automatic optimization:

```astro
---
import { Image } from "astro:assets";
import myImage from "../assets/image.jpg";
---

<Image src={myImage} alt="Descriptive alt text" />
```

Or use external URLs (as in frontmatter heroImage).

### Internal Linking

Link to other blog posts using relative paths:

```markdown
Check out my [previous post](/blog/previous-post-slug)
```

## Development

### Start Dev Server

```bash
pnpm run dev
```

Navigate to:
- Blog index: http://localhost:4321/blog
- Example posts: http://localhost:4321/blog/getting-started-with-cybersecurity-certifications

### Build for Production

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

## Content Collection Schema

The blog collection schema is defined in `src/content.config.ts`:

```typescript
const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
    schema: ({image}) => z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        updatedDate: z.date().optional(),
        heroImage: image().optional(),
        draft: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
        author: z.object({
            name: z.string(),
            avatar: image().optional(),
            bio: z.string().optional(),
            twitter: z.string().optional(),
            github: z.string().optional(),
            linkedin: z.string().optional(),
            website: z.string().optional(),
        }),
        readingTime: z.string().optional(),
    }),
});
```

## Troubleshooting

### Mermaid diagrams not rendering

Ensure you're using the correct code fence syntax:

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

The mermaid script in BlogPost.astro initializes the renderer automatically.

### shadcn components not found

If you get import errors, make sure the component is installed:

```bash
pnpm dlx shadcn@latest add [component-name]
```

### TypeScript errors

Run the type checker:

```bash
pnpm run astro check
```

### Styling issues

Check that `src/styles/globals.css` is imported in your layout:

```astro
---
import "@/styles/globals.css";
---
```

## Resources

- [Astro Documentation](https://docs.astro.build)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Mermaid Diagrams](https://mermaid.js.org/)

## License

This blog is part of the Cyberpath project. See LICENSE.md for details.

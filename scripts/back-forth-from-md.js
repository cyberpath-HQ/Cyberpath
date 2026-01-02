import { processBlogPost } from './process-blog-post.js';
import fs from 'fs/promises';

export async function backForthFromMd(filePath, platform) {
    const {
        frontmatter, content,
    } = await processBlogPost(filePath, platform);
    return {
        frontmatter,
        content,
    };
}

/* const {
    content,
} = await backForthFromMd(
    `src/content/blog/orbis-plugin-driven-desktop-platform.mdx`,
    `devto`
); */
const {
    content,
} = await backForthFromMd(
    `src/content/blog/red-team-vs-blue-team-strategies-for-advanced-penetration-testing.mdx`,
    `devto`
);

fs.writeFile(
    `src/content/blog/processed.mdx`,
    content
);

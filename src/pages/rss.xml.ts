import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
    const blog = await getCollection(`blog`);

    return rss({
        title:       `Cyberpath Blog`,
        description: `Latest articles and insights on cybersecurity certifications, career paths, and industry trends`,
        site:        context.site?.toString() ?? `https://cyberpath-hq.com`,
        items:       blog.map((post) => ({
            title:       post.data.title,
            pubDate:     post.data.pubDate,
            description: post.data.description,
            link:        `/blog/${ post.id }/`,
        })),
        customData: `<language>en-us</language>`,
    });
}

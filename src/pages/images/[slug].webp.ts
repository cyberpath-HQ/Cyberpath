import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export async function getStaticPaths() {
    const posts = await getCollection(`blog`, ({
        data,
    }) => data.draft !== true);

    return posts.map((post) => ({
        params: {
            slug: post.id,
        },
    }));
}

export const GET: APIRoute = async({
    params,
}) => {
    const {
        slug,
    } = params;

    const posts = await getCollection(`blog`, ({
        data,
    }) => data.draft !== true);

    const post = posts.find((p) => p.id === slug);

    if (!post?.data.heroImage) {
        return new Response(`Not found`, {
            status: 404,
        });
    }

    let file_path = ``;
    if (post.data.heroImage.src.startsWith(`/@fs`)) {
        // we are in development mode, use as is
        file_path = path.normalize(post.data.heroImage.src.replace(`/@fs`, ``).split(`?`)[0]);
    }
    else {
        // we are in production mode, resolve from the static assets folder
        const filename = path.basename(post.data.heroImage.src.split(`.`)[0]);
        const extension = path.extname(post.data.heroImage.src);

        file_path = path.normalize(path.join(
            import.meta.dirname,
            `../../../`,
            `src/assets/blog/`,
            `${ filename }${ extension }`
        ));
    }

    console.log(`Generating social image for ${ slug } from ${ file_path }`);
    const content = await fs.readFile(file_path);
    const img = await sharp(content)
        .resize({
            width:  1200,
            height: 630,
            fit:    `contain`,
        })
        .webp({
            quality: 80,
        })
        .toBuffer();

    return new Response(new Uint8Array(img), {
        headers: {
            "Content-Type":  `image/webp`,
            "Cache-Control": `public, max-age=31536000`,
        },
    });
};

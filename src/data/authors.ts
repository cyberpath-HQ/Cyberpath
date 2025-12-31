import type {
    ImageMetadata
} from "astro";
import ebalo_avatar from "@assets/avatars/ebalo-portrait-square.png";
import { getImage } from "astro:assets";

export interface Author {
    id:      string
    name:    string
    avatar?:   {
        default: string
        blur:    string
    }
    bio?:      string
    twitter?:  string
    github?:   string
    linkedin?: string
    website?:  string
    email?:    string
    medium?:   string
    devto?:    string
}

export const AUTHORS: Record<string, Author> = {
    ebalo: {
        id:       `ebalo`,
        name:     `Emanuele (ebalo) Balsamo`,
        bio:      `Cybersecurity and Offensive Security Expert focused on red teaming, offensive security, and proactive defense measures.`,
        twitter:  `@ebalo_LTS`,
        github:   `ebalo55`,
        linkedin: `https://www.linkedin.com/in/emanuele-balsamo-4819311a3/`,
        website:  `https://ebalo.xyz`,
        medium:   `https://ebalo.medium.com/`,
        devto:    `https://dev.to/ebalo`,
        email:    `emanuele.balsamo@cyberpath-hq.com`,
        avatar:   await prepareAuthorAvatar(ebalo_avatar),
    },
};

async function prepareAuthorAvatar(avatar: ImageMetadata | undefined): Promise<{
    default: string
    blur:    string
} | undefined> {
    if (!avatar) {
        return undefined;
    }

    const image = await getImage({
        src:     avatar,
        width:   64,
        height:  64,
        format:  `webp`,
        quality:  80,
    });
    const blurImage = await getImage({
        src:     avatar,
        width:   10,
        height:  10,
        format:  `webp`,
        quality:  10,
    });

    return {
        default: image.src,
        blur:    blurImage.src,
    };
}

export function getAuthor(id: string): Author | undefined {
    return AUTHORS[id];
}

export function getAllAuthors(): Array<Author> {
    return Object.values(AUTHORS);
}

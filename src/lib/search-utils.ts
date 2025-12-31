import type { CollectionEntry } from "astro:content";
import {
    ALL_CATEGORIES,
    classifyArticle, type Category
} from "./categories";
import fuse, {
    type FuseIndex, type IFuseOptions
} from "fuse.js";
import { omit } from "radash";

/**
 * Searchable blog post interface for Fuse.js
 */
export interface SearchableBlogPost extends Omit<CollectionEntry<`blog`>, `body` | `rendered` | `filePath` | `data`> {
    data: CollectionEntry<`blog`>[`data`] & {
        category:    Category
        readingTime: string
        url:         string
    }
}

/**
 * Transform blog posts into searchable format
 */
export function createSearchablePost(
    post: CollectionEntry<`blog`>,
    readingTime: string
): SearchableBlogPost {
    let category: Category;
    if (post.data.category) {
        if (!ALL_CATEGORIES.includes(post.data.category as unknown as Category)) {
            throw new Error(`Invalid category "${ post.data.category }" in blog post "${ post.id }"`);
        }
        category = post.data.category as unknown as Category;
    }
    else {
        category = classifyArticle(post.data.tags, post.data.title, post.data.description);
    }

    return {
        ...omit(post, [
            `body`,
            `rendered`,
            `filePath`,
            `data`,
        ]),
        data: {
            ...post.data,
            category,
            readingTime,
            url:         `/blog/${ post.id }`,
        },
    };
}

export function precomputeIndex(posts: Array<SearchableBlogPost>): FuseIndex<SearchableBlogPost> {
    return fuse.createIndex(FUSE_OPTIONS.keys!, posts);
}

/**
 * Fuse.js configuration for blog search
 */
export const FUSE_OPTIONS = {
    keys: [
        {
            name:   `data.title`,
            weight: 3,
        },
        {
            name:   `data.description`,
            weight: 2,
        },
        {
            name:   `data.tags`,
            weight: 1.5,
        },
        {
            name:   `data.category`,
            weight: 1,
        },
    ],
    threshold:          0.3,
    includeScore:       true,
    includeMatches:     true,
    minMatchCharLength: 2,
    useExtendedSearch:  true,
    ignoreDiacritics:   true,
    isCaseSensitive:    false,
    shouldSort:         true,
} as IFuseOptions<SearchableBlogPost>;



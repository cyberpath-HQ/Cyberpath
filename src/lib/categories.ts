/**
 * Blog Categories and Classification System
 *
 * Automatically classifies articles into meaningful categories based on tags and content.
 * Categories are mutually exclusive - each article belongs to exactly one category.
 */

export const CATEGORIES = {
    "Offensive Security": {
        keywords: [
            `red team`,
            `penetration testing`,
            `offensive security`,
            `exploit`,
            `c2`,
            `shellcode`,
            `attack`,
        ],
        tags:     [
            `red team`,
            `penetration testing`,
            `offensive security`,
            `exploit development`,
            `c2`,
            `shellcode`,
        ],
    },
    "Defensive Security": {
        keywords: [
            `blue team`,
            `defense`,
            `mitigation`,
            `detection`,
            `incident response`,
            `threat hunting`,
        ],
        tags:     [
            `blue team`,
            `defense`,
            `mitigation strategies`,
            `threat hunting`,
            `anomaly detection`,
            `behavioral analytics`,
        ],
    },
    "Threat Intelligence": {
        keywords: [
            `threat intelligence`,
            `apt`,
            `Advanced Persistent Threats`,
            `ttp`,
            `tactics`,
            `techniques`,
        ],
        tags:     [
            `threat intelligence`,
            `apt`,
            `Advanced Persistent Threats`,
            `ttp`,
            `tactics`,
            `techniques`,
            `procedures`,
        ],
    },
    "Certifications & Career": {
        keywords: [
            `certification`,
            `career`,
            `beginners`,
            `learning`,
            `professional development`,
        ],
        tags:     [
            `certifications`,
            `career`,
            `beginners`,
            `career growth`,
            `cybersecurity certifications`,
        ],
    },
    "Tools & Automation": {
        keywords: [
            `automation`,
            `scripting`,
            `burpsuite`,
            `tools`,
            `ai`,
            `machine learning`,
        ],
        tags:     [
            `burpsuite`,
            `automation`,
            `scripting`,
            `AI`,
            `artificial intelligence`,
            `machine learning`,
        ],
    },
    "Software Development": {
        keywords: [
            `rust`,
            `react`,
            `development`,
            `architecture`,
            `plugins`,
            `desktop`,
        ],
        tags:     [
            `rust`,
            `react`,
            `desktop`,
            `architecture`,
            `plugins`,
            `development`,
            `software development`,
        ],
    },
    "Labs & Practice": {
        keywords: [
            `home lab`,
            `practice`,
            `virtualization`,
            `learning environment`,
        ],
        tags:     [
            `home lab`,
            `practice`,
            `virtualization`,
            `learning`,
        ],
    },
    "Security Research": {
        keywords: [
            `zero day`,
            `vulnerability`,
            `research`,
            `analysis`,
            `case study`,
        ],
        tags:     [
            `zero day`,
            `vulnerability`,
            `research`,
            `case study`,
            `analysis`,
        ],
    },
} as const;

export type Category = keyof typeof CATEGORIES;
export const ALL_CATEGORIES = Object.keys(CATEGORIES) as Array<Category>;

/**
 * Automatically classify an article into a category based on its tags and title
 * @param tags Article tags
 * @param title Article title
 * @param description Article description
 * @returns The best matching category
 */
export function classifyArticle(
    tags: Array<string>,
    title: string,
    description: string
): Category {
    const lowerTags = tags.map((t) => t.toLowerCase());
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    const searchText = `${ lowerTags.join(` `) } ${ lowerTitle } ${ lowerDesc }`;

    let bestMatch: Category = `Security Research`; // Default fallback
    let bestScore = 0;

    for (const [
        category,
        config,
    ] of Object.entries(CATEGORIES)) {
        let score = 0;

        // Check exact tag matches (highest weight)
        for (const tag of config.tags) {
            if (lowerTags.includes(tag.toLowerCase())) {
                score += 10;
            }
        }

        // Check keyword matches in all content (medium weight)
        for (const keyword of config.keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                score += 5;
            }
        }

        // Check partial tag matches (lower weight)
        for (const tag of lowerTags) {
            for (const configTag of config.tags) {
                if (tag.includes(configTag.toLowerCase()) || configTag.toLowerCase().includes(tag)) {
                    score += 2;
                }
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = category as Category;
        }
    }

    return bestMatch;
}

/**
 * Get the display color for a category
 */
export function getCategoryColor(category: Category): string {
    const colors: Record<Category, string> = {
        "Offensive Security":      ``,
        "Defensive Security":      ``,
        "Threat Intelligence":     ``,
        "Certifications & Career": ``,
        "Tools & Automation":      ``,
        "Software Development":    ``,
        "Labs & Practice":         ``,
        "Security Research":       ``,
    };
    return colors[category];
}

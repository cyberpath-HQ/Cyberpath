import {
    translations, type Locale, type Translations
} from "../i18n/translations";
import { siteUrl } from "./redirect";
import type { MarkdownDocument } from "./types";

export interface PageMarkdownOptions {
    /** Canonical HTML URL of the page. */
    url:          string

    /** SEO title, when it differs from the translated one. */
    title?:       string
    description?: string
}

type LandingTranslations = Omit<Translations, `cta`> & { cta?: Translations[`cta`] };

const LOCALE_PATH: Record<Locale, string> = {
    en: `/en/`,
    it: `/it/`,
};

const LOCALE_NAME: Record<Locale, string> = {
    en: `English`,
    it: `Italiano`,
};

function normalize(value: string): string {
    return value.replace(/\s+/g, ` `).trim();
}

function bullets(items: ReadonlyArray<string>): Array<string> {
    return items.map((item) => `- ${ normalize(item) }`);
}

function definitionList(items: ReadonlyArray<{ title: string
    description:                                      string }>): Array<string> {
    return items.map((item) => `- **${ normalize(item.title) }**: ${ normalize(item.description) }`);
}

function footer(locale: Locale): Array<string> {
    const other: Locale = locale === `en` ? `it` : `en`;

    return [
        `---`,
        ``,
        `- [CyberPath blog](${ siteUrl(`/blog/`) })`,
        `- [Services](${ siteUrl(`${ LOCALE_PATH[locale] }services/`) })`,
        `- [${ LOCALE_NAME[other] } version](${ siteUrl(LOCALE_PATH[other]) })`,
        `- [Markdown version of this page](${ siteUrl(`${ LOCALE_PATH[locale] }index.md`) })`,
        `- [RSS feed](${ siteUrl(`/rss.xml`) })`,
    ];
}

/**
 * Markdown variant of a localized landing page (`/en/`, `/it/`).
 *
 * The HTML page is a React island with no server rendered copy, so the
 * markdown is rebuilt from the same translation file the components use.
 */
export function landingMarkdown(locale: Locale, options: PageMarkdownOptions): MarkdownDocument {
    const t = translations[locale] as LandingTranslations;
    const lines: Array<string> = [];

    lines.push(
        `# ${ normalize(t.hero.title) } — ${ normalize(t.hero.subtitle) }`,
        ``,
        normalize(t.hero.description),
        ``,
        `## ${ normalize(t.video.title) }`,
        ``,
        normalize(t.video.subtitle),
        ``,
        `## ${ normalize(t.security.title) }`,
        ``,
        normalize(t.security.subtitle),
        ``,
        `### ${ normalize(t.security.problems.title) }`,
        ``,
        ...definitionList(t.security.problems.items),
        ``,
        `### ${ normalize(t.security.solution.title) }`,
        ``,
        normalize(t.security.solution.subtitle),
        ``,
        ...bullets(t.security.solution.features),
        ``,
        `## ${ normalize(t.monitoring.title) }`,
        ``,
        normalize(t.monitoring.subtitle),
        ``,
        normalize(t.monitoring.description),
        ``,
        `### ${ normalize(t.monitoring.features.title) }`,
        ``,
        ...definitionList(t.monitoring.features.items),
        ``,
        `## ${ normalize(t.comparison.title) }`,
        ``,
        normalize(t.comparison.subtitle),
        ``,
        normalize(t.comparison.description),
        ``,
        `### ${ normalize(t.comparison.traditional.title) }`,
        ``,
        ...bullets(t.comparison.traditional.items),
        ``,
        `**${ normalize(t.comparison.traditional.price) } ${ normalize(t.comparison.traditional.period) }.** ${ normalize(t.comparison.traditional.note) }`,
        ``,
        `### ${ normalize(t.comparison.bastion.title) }`,
        ``,
        ...bullets(t.comparison.bastion.items),
        ``,
        `**${ normalize(t.comparison.bastion.price) } ${ normalize(t.comparison.bastion.period) }.** ${ normalize(t.comparison.bastion.note) } ${ normalize(t.comparison.bastion.savings) }`,
        ``,
        `## ${ normalize(t.pricing.title) }`,
        ``,
        normalize(t.pricing.subtitle),
        ``
    );

    for (const plan of Object.values(t.pricing.plans)) {
        lines.push(
            `### ${ normalize(plan.name) }${ plan.highlight ? ` (${ normalize(t.pricing.popular) })` : `` }`,
            ``,
            normalize(plan.description),
            ``,
            `- **${ normalize(plan.starting_at) }** ${ normalize(plan.price) } ${ normalize(plan.period) }, ${ normalize(plan.endpoints) }`,
            ...bullets(plan.features),
            ``
        );

        if (plan.note.trim()) {
            lines.push(`_${ normalize(plan.note) }_`, ``);
        }
    }

    lines.push(`_${ normalize(t.pricing.note) }_`, ``);

    lines.push(`## ${ normalize(t.faq.title) }`, ``, normalize(t.faq.subtitle), ``);

    for (const item of t.faq.items) {
        lines.push(`### ${ normalize(item.question) }`, ``, normalize(item.answer), ``);
    }

    lines.push(
        `## ${ normalize(t.reservation.title) }`,
        ``,
        normalize(t.reservation.subtitle),
        ``,
        normalize(t.reservation.description),
        ``,
        `- **${ normalize(t.reservation.duration) }** — ${ normalize(t.reservation.duration_label) }: ${ normalize(t.reservation.duration_desc) }`,
        ...bullets(t.reservation.benefits),
        ``
    );

    if (t.cta) {
        lines.push(
            `## ${ normalize(t.cta.title) }`,
            ``,
            normalize(t.cta.description),
            ``,
            `**${ normalize(t.cta.button) }**`,
            ``
        );
    }

    lines.push(...footer(locale));

    return {
        frontmatter: {
            title:       options.title ?? `${ normalize(t.hero.title) } — ${ normalize(t.hero.subtitle) }`,
            description: options.description ?? normalize(t.hero.description),
            url:         options.url,
            language:    locale,
            type:        `website`,
        },
        body: lines.join(`\n`),
    };
}

interface ServiceItem {
    id:          string;
    name:        string;
    tagline:     string;
    shortDesc:   string;
    longDesc:    string;
    features:    ReadonlyArray<string>;
    addons:      ReadonlyArray<{ name: string; desc: string }>;
    cta:         string;
    cta_link?:   string;
    popular?:    boolean;
    comingSoon?: boolean;
}

/**
 * Markdown variant of a localized services page (`/en/services/`, `/it/services/`).
 */
export function servicesMarkdown(locale: Locale, options: PageMarkdownOptions): MarkdownDocument {
    const t = translations[locale] as LandingTranslations;
    const {
        services,
    } = t;
    const items = services.items as unknown as ReadonlyArray<ServiceItem>;

    const lines: Array<string> = [
        `# ${ normalize(services.title) }`,
        ``,
        normalize(services.subtitle),
        ``,
        `_${ normalize(services.hero.tagline) }_`,
        ``,
    ];

    for (const item of items) {
        const badges = [
            item.popular ? normalize(services.popular) : null,
            item.comingSoon ? normalize(services.comingSoon) : null,
        ].filter((badge): badge is string => badge !== null);

        lines.push(
            `## ${ normalize(item.name) }`,
            ``
        );

        if (badges.length > 0) {
            lines.push(`**${ badges.join(` · `) }**`, ``);
        }

        lines.push(
            `_${ normalize(item.tagline) }_`,
            ``,
            normalize(item.longDesc),
            ``,
            ...bullets(item.features)
        );

        if (item.addons.length > 0) {
            lines.push(
                ``,
                `### ${ normalize(services.addons) }`,
                ``,
                ...item.addons.map((addon) => `- **${ normalize(addon.name) }**: ${ normalize(addon.desc) }`)
            );
        }

        if (item.cta_link) {
            const ctaTarget = item.cta_link.startsWith(`/`)
                ? new URL(item.cta_link, siteUrl(`/`)).toString()
                : item.cta_link;

            lines.push(``, `→ [${ normalize(item.cta) }](${ ctaTarget })`, ``);
        }
        else {
            lines.push(``, `**${ normalize(item.cta) }**`, ``);
        }
    }

    lines.push(
        `---`,
        ``,
        `- [CyberPath blog](${ siteUrl(`/blog/`) })`,
        `- [Start page](${ siteUrl(LOCALE_PATH[locale]) })`,
        `- [Markdown version of this page](${ siteUrl(`${ LOCALE_PATH[locale] }services/index.md`) })`
    );

    const title = options.title ?? `${ normalize(services.title) } — CyberPath`;

    return {
        frontmatter: {
            title,
            description: options.description ?? normalize(services.subtitle),
            url:         options.url,
            language:    locale,
            type:        `website`,
        },
        body: lines.join(`\n`),
    };
}

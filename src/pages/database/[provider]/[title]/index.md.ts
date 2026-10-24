import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET_BASE = "https://certdb.cyberpath-hq.com/database";

export const getStaticPaths = (async () => {
    const certifications = await getCollection("certifications", (entry) => {
        return !entry.data.draft;
    });

    return certifications.map((certification) => {
        const [ provider, title ] = certification.id.split("/");

        return {
            params: { provider, title },
            props:  { certification },
        };
    });
}) satisfies GetStaticPaths;

interface Props {
    certification: CollectionEntry<"certifications">;
}

export const GET: APIRoute<Props> = ({ params, props }) => {
    const provider = params.provider ?? "";
    const title = params.title ?? "";

    return createMarkdownResponse(markdownRedirect({
        title:     `${ props.certification.data.title } (${ props.certification.data.acronym }) — CyberPath CertDb`,
        url:       siteUrl(`/database/${ provider }/${ title }/`),
        target:    `${ TARGET_BASE }/${ provider }/${ title }`,
        linkLabel: "Open this certification on CyberPath CertDb",
        status:    301,
    }));
};

import type { APIRoute, GetStaticPaths } from "astro";
import { dash } from "radash";

import { CAREER_PATH_SPECIAL_HIDDEN, CareerPathsList } from "@/lib/career-paths";
import { markdownRedirect, siteUrl } from "@/lib/agent-markdown/redirect";
import { createMarkdownResponse } from "@/lib/agent-markdown/response";

const TARGET_BASE = "https://certdb.cyberpath-hq.com/career-paths";

export const getStaticPaths = (() => {
    return CareerPathsList
        .filter((careerPath) => {
            return careerPath !== CAREER_PATH_SPECIAL_HIDDEN;
        })
        .map((careerPath) => {
            return {
                params: { path: dash(careerPath) },
                props:  { careerPath },
            };
        });
}) satisfies GetStaticPaths;

interface Props {
    careerPath: string;
}

export const GET: APIRoute<Props> = ({ params, props }) => {
    const path = params.path ?? dash(props.careerPath);

    return createMarkdownResponse(markdownRedirect({
        title:     `CyberPath CertDb — ${ props.careerPath } career path`,
        url:       siteUrl(`/career-paths/${ path }/`),
        target:    `${ TARGET_BASE }/${ path }`,
        linkLabel: "Open this career path on CyberPath CertDb",
        status:    301,
    }));
};

import type { APIRoute } from "astro";
import Fuse from "fuse.js";
import { getCertificationMetadata } from "src/pages/database/data.json";
import { FuseConfig } from "../../database/fuse.config.ts";
import {
    getStaticPaths,
    makeCareerPathLookupTable,
} from "./data.json.ts";

/**
 * Dynamically generate a json with all the metadata from the certifications
 * @param param0 Astro API route
 */
export const GET: APIRoute = async ({ params }) => {
    const lookup_table = makeCareerPathLookupTable();

    const index = Fuse.createIndex(
        FuseConfig.keys!,
        await getCertificationMetadata(
            (entry) => entry.data.career_paths.includes(lookup_table[params.path as string]),
        ),
    );

    return Response.json(index.toJSON());
};

export { getStaticPaths };
import type { APIRoute } from "astro";
import {
    getStaticPaths,
} from "./data.json.ts";

/**
 * Dynamically generate a json with all the metadata from the certifications
 * @param param0 Astro API route
 */
export const GET: APIRoute = async ({ params, redirect }) => {
    return redirect(`https://certdb.cyberpath-hq.com/career-paths/${params.path}/data-index.json`, 301);
};

export { getStaticPaths };
import type { APIRoute } from "astro";

/**
 * Dynamically generate a json with all the metadata from the certifications
 * @param param0 Astro API route
 */
export const GET: APIRoute = async ({redirect}) => {
    return redirect("https://certdb.cyberpath-hq.com/database/data-index.json", 301);
};

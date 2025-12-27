import type { APIRoute } from "astro";
import {
    dash,
} from "radash";
import {
    CAREER_PATH_SPECIAL_HIDDEN,
    type CareerPathCollection,
    CareerPathsList,
} from "src/lib/career-paths.ts";

/**
 * Get the paths for the static site generation.
 */
export function getStaticPaths() {
    const career_paths: CareerPathCollection = CareerPathsList.filter((entry) => {
        return entry !== CAREER_PATH_SPECIAL_HIDDEN;
    });

    const kebab_career_paths = career_paths.map((career_path) => {
        return dash(career_path);
    });

    return kebab_career_paths.map((path) => ({
        params: {
            path,
        },
    }));
}

/**
 * Dynamically generate a json with all the metadata from the certifications
 */
export const GET: APIRoute = async ({ params, redirect }) => {
    return redirect(`https://certdb.cyberpath-hq.com/career-paths/${params.path}/data.json`, 301);
};
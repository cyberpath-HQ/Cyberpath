import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { omit, title } from "radash";
import type { CertificationMetadata, CertificationMetadataCollection } from "../../types/certification-metadata.ts";

/**
 * Get all the certifications metadata
 * @param {function} filter A function to filter the certifications
 * @returns {Promise<CertificationMetadataCollection>}
 */
export async function getCertificationMetadata(filter?: (entry: CollectionEntry<"certifications">) => boolean): Promise<CertificationMetadataCollection> {
    const certifications = await getCollection(
        "certifications",
        (entry) => {
            const reponse = !entry.data.draft;
            if (filter) {
                return reponse && filter(entry);
            }
            return reponse;
        },
    );

    return certifications.map(
        (certification) =>
            ({
                ...omit(certification.data, [ "draft" ]),
                image:    certification.data.image.src,
                provider: title(certification.id.split("/")[0]),
                slug:     certification.id,
            }) as CertificationMetadata,
    ) as CertificationMetadataCollection;
}

/**
 * Dynamically generate a json with all the metadata from the certifications
 */
export const GET: APIRoute = async () => {
    return Response.json(await getCertificationMetadata());
};

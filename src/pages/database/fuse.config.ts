import type { IFuseOptions } from "fuse.js";
import type { CertificationMetadata } from "../../types/certification-metadata.ts";

export const FuseConfig: IFuseOptions<CertificationMetadata> = {
    keys:              [
        {
            name:   "title",
            weight: 0.7,
        },
        {
            name:   "acronym",
            weight: 0.6,
        },
        {
            name:   "aliases",
            weight: 0.5,
        },
        {
            name:   "provider",
            weight: 0.4,
        },
        {
            name:   "career_paths",
            weight: 0.3,
        },
    ],
    isCaseSensitive:   false,
    useExtendedSearch: true,
};
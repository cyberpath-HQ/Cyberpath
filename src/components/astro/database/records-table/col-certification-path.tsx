import type { FC } from "react";

import type { CertificationMetadata } from "../../../../types/certification-metadata.ts";

export const ColCertificationPath: FC<Pick<CertificationMetadata, "career_paths">> = ({ career_paths }) => {
    return (
        <div className="text-xs leading-5 text-gray-500">
            <ul>
                {
                    career_paths.map((path) => (
                        <li>{ path }</li>
                    ))
                }
            </ul>
        </div>
    );
};
export interface CertificationMetadata {
    image: string;
    provider: string;
    title: string;
    acronym: string;
    last_updated_at: Date;
    reference: string;
    aliases?: string[] | undefined;
    career_paths: string[];
    price: string;
    currency: string;
    slug: string;
}

export type CertificationMetadataCollection = CertificationMetadata[];
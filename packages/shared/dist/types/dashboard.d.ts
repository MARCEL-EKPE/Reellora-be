export interface FeedAsset {
    id: string;
    type: string;
    sourceUrl: string;
}
export interface CategorySummary {
    id: string;
    name: string;
    slug: string;
}
export interface FeedItem {
    id: string;
    title: string;
    summary?: string;
    source: string;
    sourceUrl?: string;
    publishedAt?: string;
    category?: CategorySummary;
    assets: FeedAsset[];
}

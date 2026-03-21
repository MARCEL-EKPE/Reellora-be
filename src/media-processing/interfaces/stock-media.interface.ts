export type StockMediaProviderName = 'shutterstock';

export type StockMediaAspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface SearchStockVideoRequest {
    query: string;
    page?: number;
    perPage?: number;
    aspectRatio?: StockMediaAspectRatio;
    minDurationSeconds?: number;
    maxDurationSeconds?: number;
    minWidth?: number;
    minHeight?: number;
    keywords?: string[];
}

export interface StockVideoAsset {
    provider: StockMediaProviderName;
    assetId: string;
    title: string;
    description?: string;
    durationSeconds?: number;
    width?: number;
    height?: number;
    previewUrl?: string;
    sourceUrl?: string;
    keywords?: string[];
    raw?: unknown;
}

export interface SearchStockVideoResponse {
    provider: StockMediaProviderName;
    page: number;
    perPage: number;
    totalCount: number;
    results: StockVideoAsset[];
}

export interface LicenseStockVideoRequest {
    assetId: string;
}

export interface LicenseStockVideoResponse {
    provider: StockMediaProviderName;
    assetId: string;
    licensed: boolean;
    licenseId?: string;
    downloadUrl?: string;
    raw?: unknown;
}

export interface IStockMediaProvider {
    searchVideos(request: SearchStockVideoRequest): Promise<SearchStockVideoResponse>;
    licenseVideo(request: LicenseStockVideoRequest): Promise<LicenseStockVideoResponse>;
}

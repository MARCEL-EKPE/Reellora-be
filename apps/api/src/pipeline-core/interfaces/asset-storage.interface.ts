import { Readable } from 'stream';

export interface StoredAsset {
    storageKey: string;
    url: string;
    sizeBytes?: number;
    mimeType?: string;
}

export interface AssetUploadRequest {
    key: string;
    body: Buffer | Readable | string;
    contentType?: string;
    metadata?: Record<string, string>;
}

export const ASSET_STORAGE = Symbol('ASSET_STORAGE');

export interface AssetStorage {
    upload(request: AssetUploadRequest): Promise<StoredAsset>;
    download(key: string): Promise<Buffer>;
    getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
    delete(key: string): Promise<void>;
}

export interface PublishRequest {
    videoId: string;
    title: string;
    description: string;
    tags?: string[];
    videoStorageKey: string;
    thumbnailStorageKey?: string;
    visibility?: 'public' | 'unlisted' | 'private' | 'scheduled';
    scheduledAt?: Date;
}

export interface PublishResult {
    platformVideoId?: string;
    platformVideoUrl?: string;
    status: 'published' | 'uploading' | 'failed';
    publishedAt?: Date;
    errorMessage?: string;
}

export const PLATFORM_PUBLISHER = Symbol('PLATFORM_PUBLISHER');

export interface PlatformPublisher {
    platform: string;
    publish(request: PublishRequest): Promise<PublishResult>;
}

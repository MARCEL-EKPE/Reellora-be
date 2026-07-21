export interface ContentSourceDefinition {
    id: string;
    name: string;
    url: string;
    type: 'rss' | 'api' | 'manual';
    category?: 'news' | 'reports' | 'data' | 'policy';
    region?: 'africa' | 'nigeria' | 'global';
    enabled?: boolean;
    description?: string;
}

export interface ContentSourceItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    url?: string;
    publishedAt?: string;
}

export interface ContentSourceFetcher {
    fetch(source: ContentSourceDefinition): Promise<ContentSourceItem[]>;
}

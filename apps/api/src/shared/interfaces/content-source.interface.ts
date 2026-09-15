export interface ContentSourceAsset {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  caption?: string;
}

export interface ContentSourceDefinition {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'manual';
  category?: 'news' | 'reports' | 'data' | 'policy' | string;
  region?: 'africa' | 'nigeria' | 'global' | string;
  enabled?: boolean;
  description?: string;
}

export interface ContentSourceItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceId: string;
  url?: string;
  publishedAt?: string;
  author?: string;
  assets?: ContentSourceAsset[];
}

export interface ContentSourceFetcher {
  fetch(source: ContentSourceDefinition): Promise<ContentSourceItem[]>;
}

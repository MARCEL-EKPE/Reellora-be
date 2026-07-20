import { Injectable, Logger } from '@nestjs/common';

export interface ContentSourceDefinition {
    id: string;
    name: string;
    url: string;
    type: 'rss' | 'api' | 'manual';
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

@Injectable()
export class ContentSourceIngestionProvider {
    private readonly logger = new Logger(ContentSourceIngestionProvider.name);

    constructor(private readonly fetcher: ContentSourceFetcher) {}

    async ingestSources(): Promise<ContentSourceItem[]> {
        this.logger.log('Ingesting content sources for the new content pipeline');

        const sources: ContentSourceDefinition[] = [
            {
                id: 'reuters-africa',
                name: 'Reuters Africa',
                url: 'https://www.reuters.com/world/africa/',
                type: 'rss',
            },
            {
                id: 'bloomberg-africa',
                name: 'Bloomberg Africa',
                url: 'https://www.bloomberg.com/markets/stocks?locale=en',
                type: 'rss',
            },
        ];

        const normalizedItems: ContentSourceItem[] = [];
        for (const source of sources) {
            const fetchedItems = await this.fetcher.fetch(source);
            normalizedItems.push(...fetchedItems.map((item) => ({
                ...item,
                source: item.source || source.name,
                url: item.url || source.url,
            })));
        }

        return normalizedItems;
    }
}

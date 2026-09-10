import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Parser from 'rss-parser';
import type {
    ContentSourceDefinition,
    ContentSourceFetcher,
    ContentSourceItem,
} from '../interfaces/content-source.interface';
import contentSourcesConfig from '../config/content-sources.config';

@Injectable()
export class RssContentSourceFetcher implements ContentSourceFetcher {
    private readonly logger = new Logger(RssContentSourceFetcher.name);
    private readonly parser = new Parser();

    async fetch(source: ContentSourceDefinition): Promise<ContentSourceItem[]> {
        try {
            const result = await this.parser.parseURL(source.url);
            return (result.items || []).map((item, index) => ({
                id: `${source.id}-${index + 1}`,
                title: item.title || 'Untitled source item',
                summary: item.contentSnippet || item.content || 'No summary available.',
                source: source.name,
                url: item.link || source.url,
                publishedAt: item.pubDate || item.isoDate,
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Unable to fetch content source ${source.name}: ${message}`);
            return [];
        }
    }
}

@Injectable()
export class ContentSourceIngestionProvider {
    private readonly logger = new Logger(ContentSourceIngestionProvider.name);

    constructor(
        @Inject('CONTENT_SOURCE_FETCHER')
        private readonly fetcher: ContentSourceFetcher,
        @Inject(contentSourcesConfig.KEY)
        private readonly config: ConfigType<typeof contentSourcesConfig>,
    ) { }

    getConfiguredSources(): ContentSourceDefinition[] {
        return this.config.sources.filter((source) => source.enabled !== false);
    }

    async ingestSources(): Promise<ContentSourceItem[]> {
        this.logger.log('Ingesting content sources for the new content pipeline');

        const sources = this.getConfiguredSources();
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

import { Inject, Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import type {
    ContentSourceDefinition,
    ContentSourceFetcher,
    ContentSourceItem,
} from '../interfaces/content-source.interface';

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
    ) { }

    getConfiguredSources(): ContentSourceDefinition[] {
        const sources: ContentSourceDefinition[] = [
            {
                id: 'reuters-africa',
                name: 'Reuters Africa',
                url: 'https://reutersbest.com/region/africa/feed/',
                type: 'rss',
                category: 'news',
                region: 'africa',
                enabled: true,
                description: 'Fast breaking African and business news wire coverage (via reutersbest.com aggregator).',
            },
            {
                id: 'businessday-nigeria',
                name: 'BusinessDay Nigeria',
                url: 'https://businessday.ng/feed/',
                type: 'rss',
                category: 'news',
                region: 'nigeria',
                enabled: true,
                description: 'Strong Nigerian corporate, policy, market, and economy reporting.',
            },
            {
                id: 'afdb-news',
                name: 'African Development Bank News',
                url: 'https://www.afdb.org/en/news-and-events',
                type: 'rss',
                category: 'reports',
                region: 'africa',
                enabled: true,
                description: 'Development finance, infrastructure, and policy updates.',
            },
            {
                id: 'imf-africa-data',
                name: 'IMF Africa Data',
                url: 'https://www.imf.org/en/rss',
                type: 'rss',
                category: 'data',
                region: 'africa',
                enabled: true,
                description: 'Macroeconomic analysis and regional policy updates.',
            },
            {
                id: 'world-bank-africa-data',
                name: 'World Bank Africa Data',
                url: 'https://www.worldbank.org/en/news/all',
                type: 'rss',
                category: 'data',
                region: 'africa',
                enabled: true,
                description: 'Development and regional economic data updates.',
            },
        ];
        return sources.filter((source) => source.enabled !== false);
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

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Parser from 'rss-parser';
import type {
  ContentSourceAsset,
  ContentSourceDefinition,
  ContentSourceFetcher,
  ContentSourceItem,
} from '../../shared/interfaces/content-source.interface';
import contentSourcesConfig from '../config/content-sources.config';

@Injectable()
export class RssContentSourceFetcher implements ContentSourceFetcher {
  private readonly logger = new Logger(RssContentSourceFetcher.name);
  private readonly parser = new Parser();

  async fetch(source: ContentSourceDefinition): Promise<ContentSourceItem[]> {
    try {
      const result = await this.parser.parseURL(source.url);
      return (result.items || []).map((item, index) => {
        const assets = this.extractAssets(item);
        return {
          id: `${source.id}-${index + 1}`,
          title: item.title || 'Untitled source item',
          summary: item.contentSnippet || item.content || 'No summary available.',
          source: source.name,
          sourceId: source.id,
          url: item.link || source.url,
          publishedAt: item.pubDate || item.isoDate,
          author: item.creator || item.author,
          assets,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Unable to fetch content source ${source.name}: ${message}`,
      );
      return [];
    }
  }

  private extractAssets(item: Record<string, unknown>): ContentSourceAsset[] {
    const assets: ContentSourceAsset[] = [];
    const enclosure = item.enclosure as
      | { url?: string; type?: string; length?: string }
      | undefined;
    if (enclosure?.url) {
      assets.push({
        type: enclosure.type?.startsWith('video') ? 'video' : 'image',
        url: enclosure.url,
        mimeType: enclosure.type,
      });
    }

    const mediaContent = (item['media:content'] || item.mediaContent) as
      | { url?: string; type?: string; medium?: string }
      | undefined;
    if (mediaContent?.url && !assets.find((a) => a.url === mediaContent.url)) {
      assets.push({
        type: mediaContent.medium === 'video' ? 'video' : 'image',
        url: mediaContent.url,
        mimeType: mediaContent.type,
      });
    }

    const thumbnail = (item['media:thumbnail'] || item.mediaThumbnail) as
      | { url?: string }
      | undefined;
    if (thumbnail?.url && !assets.find((a) => a.url === thumbnail.url)) {
      assets.push({
        type: 'image',
        url: thumbnail.url,
      });
    }

    return assets;
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
  ) {}

  getConfiguredSources(): ContentSourceDefinition[] {
    return this.config.sources.filter((source) => source.enabled !== false);
  }

  async fetchSource(source: ContentSourceDefinition): Promise<ContentSourceItem[]> {
    const fetchedItems = await this.fetcher.fetch(source);
    return fetchedItems.map((item) => ({
      ...item,
      source: item.source || source.name,
      url: item.url || source.url,
      sourceId: item.sourceId || source.id,
    }));
  }

  async ingestSources(): Promise<ContentSourceItem[]> {
    this.logger.log('Ingesting content sources for the new content pipeline');

    const sources = this.getConfiguredSources();
    const normalizedItems: ContentSourceItem[] = [];

    for (const source of sources) {
      const fetchedItems = await this.fetchSource(source);
      normalizedItems.push(...fetchedItems);
    }

    return normalizedItems;
  }
}

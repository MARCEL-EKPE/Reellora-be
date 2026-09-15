import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Category,
} from '../../pipeline-core/entities/category.entity';
import { ContentFeed } from '../../pipeline-core/entities/content-feed.entity';
import { NewsAsset } from '../../pipeline-core/entities/news-asset.entity';
import {
  NewsItem,
  NewsItemStatus,
} from '../../pipeline-core/entities/news-item.entity';
import type {
  ContentSourceDefinition,
  ContentSourceItem,
} from '../../shared/interfaces/content-source.interface';

@Injectable()
export class NewsItemIngestionService {
  private readonly logger = new Logger(NewsItemIngestionService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ContentFeed)
    private readonly feedRepository: Repository<ContentFeed>,
    @InjectRepository(NewsItem)
    private readonly newsItemRepository: Repository<NewsItem>,
    @InjectRepository(NewsAsset)
    private readonly newsAssetRepository: Repository<NewsAsset>,
  ) {}

  async ingestFromSources(
    sourceDefinitions: ContentSourceDefinition[],
    itemsBySource: Map<string, ContentSourceItem[]>,
  ): Promise<NewsItem[]> {
    const created: NewsItem[] = [];

    for (const source of sourceDefinitions) {
      const items = itemsBySource.get(source.id) ?? [];
      const category = await this.ensureCategory(source.category ?? 'general');
      const feed = await this.ensureFeed(source, category.id);

      for (const item of items) {
        const newsItem = await this.ingestItem(item, feed, category);
        if (newsItem) {
          created.push(newsItem);
        }
      }
    }

    this.logger.log(`Ingested ${created.length} new news item(s)`);
    return created;
  }

  private async ensureCategory(name: string): Promise<Category> {
    const slug = this.slugify(name);
    let category = await this.categoryRepository.findOne({ where: { slug } });

    if (!category) {
      category = this.categoryRepository.create({
        name,
        slug,
        enabled: true,
      });
      await this.categoryRepository.save(category);
    }

    return category;
  }

  private async ensureFeed(
    source: ContentSourceDefinition,
    categoryId: string,
  ): Promise<ContentFeed> {
    let feed = await this.feedRepository.findOne({
      where: { sourceId: source.id },
    });

    if (!feed) {
      feed = this.feedRepository.create({
        sourceId: source.id,
        name: source.name,
        url: source.url,
        type: source.type,
        region: source.region,
        description: source.description,
        enabled: source.enabled !== false,
        categoryId,
      });
      await this.feedRepository.save(feed);
    }

    return feed;
  }

  private async ingestItem(
    item: ContentSourceItem,
    feed: ContentFeed,
    category: Category,
  ): Promise<NewsItem | null> {
    const normalizedUrl = item.url || '';
    const existing = normalizedUrl
      ? await this.newsItemRepository.findOne({ where: { sourceUrl: normalizedUrl } })
      : null;

    if (existing) {
      this.logger.debug(`Skipping duplicate news item: ${item.title}`);
      return null;
    }

    const newsItem = this.newsItemRepository.create({
      title: item.title,
      summary: item.summary,
      source: item.source,
      sourceUrl: normalizedUrl,
      author: item.author,
      externalId: item.id,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      status: NewsItemStatus.PUBLISHED_TO_FEED,
      categoryId: category.id,
      feedId: feed.id,
    });

    const saved = await this.newsItemRepository.save(newsItem);

    if (item.assets && item.assets.length > 0) {
      const assets = item.assets.map((asset) =>
        this.newsAssetRepository.create({
          newsItemId: saved.id,
          type: asset.type,
          sourceUrl: asset.url,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
          durationSeconds: asset.durationSeconds,
          caption: asset.caption,
          attribution: item.source,
        }),
      );
      await this.newsAssetRepository.save(assets);
    }

    return saved;
  }

  async findAvailableItems(limit = 50): Promise<NewsItem[]> {
    return this.newsItemRepository.find({
      where: { status: NewsItemStatus.PUBLISHED_TO_FEED },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['category', 'feed', 'assets'],
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

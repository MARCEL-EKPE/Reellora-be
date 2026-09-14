import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../pipeline-core/entities/article.entity';
import { ContentSourceItem } from '../interfaces/content-source.interface';

@Injectable()
export class ArticleIngestionService {
  private readonly logger = new Logger(ArticleIngestionService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async ingestArticles(items: ContentSourceItem[]): Promise<Article[]> {
    const articles: Article[] = [];

    for (const item of items) {
      const normalizedUrl = item.url || '';
      const existing = normalizedUrl
        ? await this.articleRepository.findOne({
            where: { url: normalizedUrl },
          })
        : null;

      if (existing) {
        this.logger.debug(`Skipping duplicate article: ${item.title}`);
        continue;
      }

      const article = this.articleRepository.create({
        source: item.source,
        title: item.title,
        summary: item.summary,
        url: normalizedUrl,
        author: '',
        externalId: item.id,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      });

      articles.push(await this.articleRepository.save(article));
    }

    this.logger.log(`Ingested ${articles.length} new article(s)`);
    return articles;
  }

  async findUnprocessedArticles(limit = 10): Promise<Article[]> {
    // Articles not yet linked to a video are candidates for pipeline processing.
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.video', 'video')
      .where('video.id IS NULL')
      .orderBy('article.publishedAt', 'DESC')
      .take(limit);

    return query.getMany();
  }
}

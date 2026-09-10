import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Article } from '../../pipeline-core/entities/article.entity';
import researchConfig from '../config/research.config';
import type { ResearchResult } from '../interfaces/research.interface';

@Injectable()
export class ResearchProvider {
    constructor(
        @Inject(researchConfig.KEY)
        private readonly config: ConfigType<typeof researchConfig>,
    ) {}

    async researchArticle(article: Article): Promise<ResearchResult> {
        if (!this.config.useMockResearch) {
            throw new BadRequestException('Research LLM not configured');
        }

        return {
            topic: article.title,
            summary: article.summary ?? article.content ?? `Research summary for ${article.title}`,
            keyFacts: [`Source: ${article.source}`, `Title: ${article.title}`],
            entities: [],
            timeline: [],
            uncertainties: [],
            sources: article.url ? [{ url: article.url, title: article.title }] : [],
        };
    }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { NewsItem } from '../../pipeline-core/entities/news-item.entity';
import { OpenAiClientProvider } from '../../openai/providers/openai-client.provider';
import researchConfig from '../config/research.config';
import type { ResearchResult } from '../interfaces/research.interface';

const RESEARCH_SYSTEM_PROMPT = `You are a senior research analyst for an African business news YouTube channel.
Given a news item, extract the key facts, entities, timeline, and uncertainties needed for a scriptwriter.
Respond with ONLY a JSON object, no prose, no markdown fences, matching:
{
  "topic": "<short punchy topic/title>",
  "summary": "<one paragraph summary>",
  "keyFacts": ["<fact 1>", "<fact 2>", ...],
  "entities": [{"name": "<name>", "type": "person|company|country|organization|product|event"}, ...],
  "timeline": [{"event": "<event>", "date": "<ISO date or approximate>"}, ...],
  "uncertainties": ["<uncertainty 1>", ...],
  "sources": [{"title": "<title>", "url": "<url>"}]
}`;

@Injectable()
export class ResearchProvider {
  private readonly logger = new Logger(ResearchProvider.name);

  constructor(
    @Inject(researchConfig.KEY)
    private readonly config: ConfigType<typeof researchConfig>,
    private readonly openAiClient: OpenAiClientProvider,
  ) {}

  async researchNewsItem(newsItem: NewsItem): Promise<ResearchResult> {
    if (this.config.useMockResearch) {
      return this.mockResearch(newsItem);
    }

    const prompt = this.buildPrompt(newsItem);
    const response = await this.openAiClient.complete({
      system: RESEARCH_SYSTEM_PROMPT,
      prompt,
      model: this.config.model,
      maxTokens: 2048,
      temperature: 0.3,
      jsonMode: true,
    });

    return this.parseResearchResponse(response.text);
  }

  private buildPrompt(newsItem: NewsItem): string {
    return `News item title: ${newsItem.title}
Source: ${newsItem.source}
Published: ${newsItem.publishedAt?.toISOString() || 'unknown'}
URL: ${newsItem.sourceUrl || 'unknown'}
Summary: ${newsItem.summary || newsItem.content || 'No summary available'}

Extract the structured research object now.`;
  }

  private parseResearchResponse(raw: string): ResearchResult {
    try {
      const jsonText = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonText) as Partial<ResearchResult>;

      return {
        topic: parsed.topic || 'Untitled topic',
        summary: parsed.summary || '',
        keyFacts: parsed.keyFacts ?? [],
        entities: parsed.entities ?? [],
        timeline: parsed.timeline ?? [],
        uncertainties: parsed.uncertainties ?? [],
        sources: parsed.sources ?? [],
      };
    } catch (error) {
      this.logger.error(`Failed to parse research response: ${raw}`);
      throw new BadRequestException(
        'OpenAI returned an unparsable research result',
      );
    }
  }

  private mockResearch(newsItem: NewsItem): ResearchResult {
    return {
      topic: newsItem.title,
      summary:
        newsItem.summary ??
        newsItem.content ??
        `Research summary for ${newsItem.title}`,
      keyFacts: [`Source: ${newsItem.source}`, `Title: ${newsItem.title}`],
      entities: [],
      timeline: [],
      uncertainties: [],
      sources: newsItem.sourceUrl
        ? [{ url: newsItem.sourceUrl, title: newsItem.title }]
        : [],
    };
  }
}

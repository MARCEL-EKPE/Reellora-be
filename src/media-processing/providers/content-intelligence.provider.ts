import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ContentSourceItem } from '../../content-ingestion/interfaces/content-source.interface';
import { ContentBrief } from '../interfaces/content-brief.interface';
import { AnthropicClientProvider } from './anthropic-client.provider';

const SYSTEM_PROMPT = `You are a senior news analyst for an African business YouTube channel.
Given a list of recently ingested news/report items, pick the SINGLE most newsworthy and
impactful story for an African business audience, then extract the facts needed to brief
a scriptwriter. Respond with ONLY a JSON object, no prose, no markdown fences, matching:
{
  "selectedIndex": <index of the chosen item from the list>,
  "topic": "<short punchy topic/title>",
  "angle": "<one sentence describing the story angle/why it matters now>",
  "keyFacts": ["<fact 1>", "<fact 2>", ...],
  "statistics": ["<stat 1 with figure>", "<stat 2 with figure>", ...]
}`;

/**
 * INTELLIGENCE LAYER: turns raw ingested feed items into a structured
 * brief (angle, facts, stats) that the script generator can work from,
 * instead of narrating raw RSS summaries.
 */
@Injectable()
export class ContentIntelligenceProvider {
    private readonly logger = new Logger(ContentIntelligenceProvider.name);

    constructor(private readonly anthropicClient: AnthropicClientProvider) { }

    async buildBrief(items: ContentSourceItem[], topicHint?: string): Promise<ContentBrief> {
        if (!items.length) {
            throw new BadRequestException('Cannot build a content brief from zero source items');
        }

        const prompt = this.buildPrompt(items, topicHint);
        const raw = await this.anthropicClient.complete({
            system: SYSTEM_PROMPT,
            prompt,
            maxTokens: 1024,
            temperature: 0.3,
        });

        return this.parseBrief(raw, items);
    }

    private buildPrompt(items: ContentSourceItem[], topicHint?: string): string {
        const list = items
            .map((item, index) => `[${index}] (${item.source}) ${item.title}\n    ${item.summary}`)
            .join('\n');

        const hint = topicHint ? `\nPreferred topic focus: ${topicHint}` : '';
        return `Here are the available items:\n${list}${hint}`;
    }

    private parseBrief(raw: string, items: ContentSourceItem[]): ContentBrief {
        let parsed: {
            selectedIndex?: number;
            topic?: string;
            angle?: string;
            keyFacts?: string[];
            statistics?: string[];
        };

        try {
            const jsonText = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
            parsed = JSON.parse(jsonText);
        } catch (error) {
            this.logger.error(`Failed to parse intelligence layer response: ${raw}`);
            throw new BadRequestException('Anthropic returned an unparsable content brief');
        }

        const selected = items[parsed.selectedIndex ?? 0] ?? items[0];

        return {
            topic: parsed.topic || selected.title,
            angle: parsed.angle || '',
            keyFacts: parsed.keyFacts ?? [],
            statistics: parsed.statistics ?? [],
            sources: [{ title: selected.title, source: selected.source, url: selected.url }],
        };
    }
}

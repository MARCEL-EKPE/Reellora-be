import { Injectable, Logger } from '@nestjs/common';
import { ContentBrief } from '../interfaces/content-brief.interface';
import { AnthropicClientProvider } from './anthropic-client.provider';

const SYSTEM_PROMPT = `You are the scriptwriter for an African business news YouTube channel.
Tone: authoritative but accessible, for an African business audience.
Write an ~8-minute narration script (roughly 1100-1300 words) with four clearly
signposted sections: HOOK, CONTEXT, ANALYSIS, CONCLUSION. Use the supplied facts and
statistics accurately, do not invent numbers, and write plain narration text only
(no stage directions, no markdown, no section headers in the final output).`;

@Injectable()
export class ContentScriptGeneratorProvider {
    private readonly logger = new Logger(ContentScriptGeneratorProvider.name);

    constructor(private readonly anthropicClient: AnthropicClientProvider) { }

    async generateScript(brief: ContentBrief): Promise<string> {
        this.logger.log(`Generating script for topic: ${brief.topic}`);

        const prompt = this.buildPrompt(brief);
        return this.anthropicClient.complete({
            system: SYSTEM_PROMPT,
            prompt,
            maxTokens: 4096,
            temperature: 0.7,
        });
    }

    private buildPrompt(brief: ContentBrief): string {
        const facts = brief.keyFacts.map((fact) => `- ${fact}`).join('\n') || '- (none provided)';
        const stats = brief.statistics.map((stat) => `- ${stat}`).join('\n') || '- (none provided)';
        const sources = brief.sources.map((s) => `- ${s.title} (${s.source})`).join('\n');

        return `Topic: ${brief.topic}
Story angle: ${brief.angle}

Key facts:
${facts}

Statistics:
${stats}

Sources:
${sources}

Write the full narration script now.`;
    }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { OpenAiClientProvider } from '../../openai/providers/openai-client.provider';
import type { ResearchResult } from '../../research/interfaces/research.interface';
import scriptConfig from '../config/script.config';
import type { VideoScript } from '../interfaces/script.interface';

const SCRIPT_SYSTEM_PROMPT = `You are the scriptwriter for an African business news YouTube channel.
Tone: authoritative but accessible, for an African business audience.
Write a YouTube narration script based on the provided research. The script should be roughly
5-8 minutes long when spoken (target word count provided).
Structure the script with clearly signposted sections: HOOK, CONTEXT, ANALYSIS, CONCLUSION.
Use the supplied facts and statistics accurately. Do not invent numbers.
Output ONLY a JSON object, no prose, no markdown fences, matching:
{
  "title": "<engaging video title>",
  "hook": "<opening 1-2 sentences>",
  "sections": ["<paragraph 1>", "<paragraph 2>", ...],
  "conclusion": "<closing paragraph>",
  "fullText": "<entire script as plain narration text>",
  "keywords": ["<keyword 1>", ...],
  "tags": ["<tag 1>", ...],
  "thumbnailConcept": "<description of thumbnail image>",
  "estimatedDurationSeconds": <number>
}`;

@Injectable()
export class ScriptProvider {
  private readonly logger = new Logger(ScriptProvider.name);

  constructor(
    @Inject(scriptConfig.KEY)
    private readonly config: ConfigType<typeof scriptConfig>,
    private readonly openAiClient: OpenAiClientProvider,
  ) {}

  async generateScript(research: ResearchResult): Promise<VideoScript> {
    if (this.config.useMockScript) {
      return this.mockScript();
    }

    const prompt = this.buildPrompt(research);
    const response = await this.openAiClient.complete({
      system: SCRIPT_SYSTEM_PROMPT,
      prompt,
      model: this.config.model,
      maxTokens: 4096,
      temperature: 0.7,
      jsonMode: true,
    });

    return this.parseScriptResponse(response.text);
  }

  private buildPrompt(research: ResearchResult): string {
    const targetWords = this.config.maxScriptWords;
    const facts = research.keyFacts.map((fact) => `- ${fact}`).join('\n');
    const sources = (research.sources || [])
      .map((s) => `- ${JSON.stringify(s)}`)
      .join('\n');

    return `Topic: ${research.topic}
Summary: ${research.summary}

Key facts:
${facts}

Sources:
${sources}

Target spoken duration: ${this.config.targetDurationSeconds} seconds.
Target word count: approximately ${targetWords} words.

Write the full video script now.`;
  }

  private parseScriptResponse(raw: string): VideoScript {
    try {
      const jsonText = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      const parsed = JSON.parse(jsonText) as Partial<VideoScript>;

      return {
        title: parsed.title || 'Untitled video',
        hook: parsed.hook || '',
        sections: parsed.sections ?? [],
        conclusion: parsed.conclusion || '',
        fullText:
          parsed.fullText ||
          [parsed.hook, ...(parsed.sections ?? []), parsed.conclusion]
            .filter(Boolean)
            .join('\n\n'),
        keywords: parsed.keywords ?? [],
        tags: parsed.tags ?? [],
        thumbnailConcept: parsed.thumbnailConcept || '',
        estimatedDurationSeconds:
          parsed.estimatedDurationSeconds ?? this.config.targetDurationSeconds,
      };
    } catch (error) {
      this.logger.error(`Failed to parse script response: ${raw}`);
      throw new BadRequestException('OpenAI returned an unparsable script');
    }
  }

  private mockScript(): VideoScript {
    const title = 'Mock Video Script';
    const hook =
      'This is a deterministic placeholder hook for script generation.';
    const sections = [
      'Introduction: Present the researched topic and explain why it matters.',
      'Main section: Summarize the key findings and supporting details.',
      'Final section: Reinforce the central takeaway for the audience.',
    ];
    const conclusion = 'This concludes the deterministic placeholder script.';

    return {
      title,
      hook,
      sections,
      conclusion,
      fullText: [hook, ...sections, conclusion].join('\n\n'),
      keywords: ['mock', 'video', 'script'],
      tags: ['mock-script', 'video-pipeline'],
      thumbnailConcept:
        'A clean placeholder thumbnail with the words “Mock Video Script”.',
      estimatedDurationSeconds: this.config.targetDurationSeconds,
    };
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import type { ResearchResult } from '../../research/interfaces/research.interface';
import scriptConfig from '../config/script.config';
import type { VideoScript } from '../interfaces/script.interface';

@Injectable()
export class ScriptProvider {
  constructor(
    @Inject(scriptConfig.KEY)
    private readonly config: ConfigType<typeof scriptConfig>,
  ) {}

  async generateScript(research: ResearchResult): Promise<VideoScript> {
    if (!this.config.useMockScript) {
      throw new BadRequestException('Script LLM not configured');
    }

    const title = 'Mock Video Script';
    const hook = 'This is a deterministic placeholder hook for script generation.';
    const sections = [
      'Introduction: Present the researched topic and explain why it matters.',
      'Main section: Summarize the key findings and supporting details.',
      'Final section: Reinforce the central takeaway for the audience.',
    ];
    const conclusion = 'This concludes the deterministic placeholder script.';

    void research;

    return {
      title,
      hook,
      sections,
      conclusion,
      fullText: [hook, ...sections, conclusion].join('\n\n'),
      keywords: ['mock', 'video', 'script'],
      tags: ['mock-script', 'video-pipeline'],
      thumbnailConcept: 'A clean placeholder thumbnail with the words “Mock Video Script”.',
      estimatedDurationSeconds: this.config.targetDurationSeconds,
    };
  }
}

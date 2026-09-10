import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { VideoScript } from '../../script/interfaces/script.interface';
import videoPlanningConfig from '../config/video-planning.config';
import type { VideoPlan, VideoScene, VisualDescription } from '../interfaces/video-plan.interface';

const VISUAL_TYPES: Array<VisualDescription['type']> = [
  'runway',
  'image',
  'stock',
  'graphic',
  'map',
];

@Injectable()
export class VideoPlannerProvider {
  constructor(
    @Inject(videoPlanningConfig.KEY)
    private readonly config: ConfigType<typeof videoPlanningConfig>,
  ) {}

  async createPlan(script: VideoScript): Promise<VideoPlan> {
    if (!this.config.useMockPlanner) {
      throw new BadRequestException('Video planner LLM not configured');
    }

    const maxScenes = Math.min(5, this.config.maxScenes);
    const scenes: VideoScene[] = [];

    for (let i = 0; i < maxScenes; i += 1) {
      scenes.push({
        id: `scene-mock-${i + 1}`,
        order: i + 1,
        narration: `Scene ${i + 1}: ${script.title || 'Untitled'}`,
        durationSeconds: this.config.defaultSceneDurationSeconds,
        visual: {
          type: VISUAL_TYPES[i % VISUAL_TYPES.length],
          prompt: `Visual for scene ${i + 1} based on: ${
            script.fullText ? script.fullText.slice(0, 100) : script.title || 'content'
          }`,
        },
        transition: i < maxScenes - 1 ? { type: 'cut' } : undefined,
      });
    }

    return {
      title: script.title,
      estimatedDurationSeconds: maxScenes * this.config.defaultSceneDurationSeconds,
      scenes,
    };
  }
}

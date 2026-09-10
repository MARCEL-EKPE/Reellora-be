import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { OpenAiClientProvider } from '../../openai/providers/openai-client.provider';
import type { VideoScript } from '../../script/interfaces/script.interface';
import videoPlanningConfig from '../config/video-planning.config';
import type { VideoPlan, VideoScene, VisualDescription } from '../interfaces/video-plan.interface';

const PLANNER_SYSTEM_PROMPT = `You are a video director for an African business news YouTube channel.
Convert the provided narration script into a scene-by-scene video production plan.
Each scene should have narration text, a target duration, and a detailed visual prompt for an AI video generator.
Respond with ONLY a JSON object, no prose, no markdown fences, matching:
{
  "title": "<video title>",
  "estimatedDurationSeconds": <number>,
  "scenes": [
    {
      "order": 1,
      "narration": "<narration text for this scene>",
      "durationSeconds": <number>,
      "visual": {
        "type": "runway",
        "prompt": "<detailed visual prompt>"
      },
      "transition": { "type": "cut" }
    }
  ]
}`;

const VISUAL_TYPES: Array<VisualDescription['type']> = [
    'runway',
    'image',
    'stock',
    'graphic',
    'map',
];

@Injectable()
export class VideoPlannerProvider {
    private readonly logger = new Logger(VideoPlannerProvider.name);

    constructor(
        @Inject(videoPlanningConfig.KEY)
        private readonly config: ConfigType<typeof videoPlanningConfig>,
        private readonly openAiClient: OpenAiClientProvider,
    ) { }

    async createPlan(script: VideoScript): Promise<VideoPlan> {
        if (this.config.useMockPlanner) {
            return this.mockPlan(script);
        }

        const prompt = this.buildPrompt(script);
        const response = await this.openAiClient.complete({
            system: PLANNER_SYSTEM_PROMPT,
            prompt,
            model: this.config.model,
            maxTokens: 4096,
            temperature: 0.7,
            jsonMode: true,
        });

        return this.parsePlanResponse(response.text);
    }

    private buildPrompt(script: VideoScript): string {
        return `Video title: ${script.title}
Target duration: ${script.estimatedDurationSeconds} seconds
Maximum scenes: ${this.config.maxScenes}

Full script:
${script.fullText}

Create the scene plan now.`;
    }

    private parsePlanResponse(raw: string): VideoPlan {
        try {
            const jsonText = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
            const parsed = JSON.parse(jsonText) as Partial<VideoPlan>;

            const scenes = (parsed.scenes ?? []).map((scene, index) => ({
                order: scene.order ?? index + 1,
                narration: scene.narration || '',
                durationSeconds: scene.durationSeconds ?? this.config.defaultSceneDurationSeconds,
                visual: scene.visual,
                transition: scene.transition,
            }));

            return {
                title: parsed.title || 'Untitled video plan',
                estimatedDurationSeconds: parsed.estimatedDurationSeconds ?? scenes.length * this.config.defaultSceneDurationSeconds,
                scenes,
            };
        } catch (error) {
            this.logger.error(`Failed to parse video plan response: ${raw}`);
            throw new BadRequestException('OpenAI returned an unparsable video plan');
        }
    }

    private mockPlan(script: VideoScript): VideoPlan {
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
                    prompt: `Visual for scene ${i + 1} based on: ${script.fullText ? script.fullText.slice(0, 100) : script.title || 'content'}`,
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

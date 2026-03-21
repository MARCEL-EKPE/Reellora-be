import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';

export interface SceneFrameCandidate {
    sceneIndex: number;
    frames: Array<{ path: string; timestamp: number }>;
}

export interface SceneFrameSelection {
    sceneIndex: number;
    bestFramePath: string;
    bestTimestamp: number;
}

@Injectable()
export class VisionFrameSelectorProvider {
    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>,
    ) { }

    /**
     * Given narration scene texts and their candidate frames extracted from the original video,
     * asks the vision model to pick the frame that best visually illustrates each scene's narration.
     * All scenes are batched into a single API call to minimise cost.
     */
    async selectBestFramesForScenes(params: {
        scenes: Array<{ index: number; text: string }>;
        sceneCandidates: SceneFrameCandidate[];
    }): Promise<SceneFrameSelection[]> {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const { scenes, sceneCandidates } = params;
        if (!scenes?.length || !sceneCandidates?.length) return [];

        const candidateMap = new Map(sceneCandidates.map(c => [c.sceneIndex, c.frames]));

        // Build a single multi-part message: instruction → per-scene text + candidate frames
        const content: any[] = [
            {
                type: 'text',
                text:
                    `You are matching narration scenes to video frames.\n` +
                    `For each scene you are given a narration sentence and numbered candidate frames.\n` +
                    `Select the frame that best visually illustrates what is described — prefer frames that show the actual event (violence, destruction, crowds, key figures, on-screen text, etc.).\n` +
                    `Return ONLY a JSON array with one entry per scene: [{ "sceneIndex": number, "frameIndex": number }]`,
            },
        ];

        for (const scene of scenes) {
            const frames = candidateMap.get(scene.index) ?? [];
            if (!frames.length) continue;

            content.push({ type: 'text', text: `\n--- Scene ${scene.index}: "${scene.text}" ---` });

            for (let fi = 0; fi < frames.length; fi++) {
                const frame = frames[fi];
                try {
                    const base64 = fs.readFileSync(frame.path).toString('base64');
                    content.push({ type: 'text', text: `Frame ${fi} (t=${frame.timestamp.toFixed(2)}s):` });
                    content.push({
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' },
                    });
                } catch {
                    // skip unreadable frames silently
                }
            }
        }

        const messages = [
            { role: 'system', content: 'You select the best video frame for each narration scene.' },
            { role: 'user', content },
        ];

        try {
            const res = await axios.post(
                `${this.config.openAIApiBase}/v1/chat/completions`,
                { model: this.config.openAIVisionModel, messages, temperature: 0.1, max_tokens: 512 },
                { headers: { Authorization: `Bearer ${this.config.openAIApiKey}` } },
            );

            const raw: string = res.data?.choices?.[0]?.message?.content ?? '';
            const parsed: Array<{ sceneIndex: number; frameIndex: number }> = this._parseJsonArray(raw) ?? [];

            return parsed
                .map(({ sceneIndex, frameIndex }) => {
                    const frames = candidateMap.get(sceneIndex) ?? [];
                    const frame = frames[frameIndex] ?? frames[0];
                    if (!frame) return null;
                    return { sceneIndex, bestFramePath: frame.path, bestTimestamp: frame.timestamp };
                })
                .filter((r): r is SceneFrameSelection => r !== null);
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.warn(`Vision frame selection failed (status ${status}): ${data ? JSON.stringify(data) : err?.message}`);
            return [];
        }
    }

    private _parseJsonArray(content: string): any[] | null {
        if (!content) return null;
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            const start = content.indexOf('[');
            const end = content.lastIndexOf(']');
            if (start >= 0 && end >= 0) {
                try { return JSON.parse(content.substring(start, end + 1)); } catch { /* fall through */ }
            }
            return null;
        }
    }
}

import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import { SceneClipCandidate } from '../interfaces/scene-clip-candidate';
import { SceneClipSelection } from '../interfaces/scene-clip-selection';
import { LogoRegionDetection } from '../interfaces/logo-region-detection';

@Injectable()
export class VisionFrameSelectorProvider {
    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>,
    ) { }

    async selectBestClipsForScenes(params: {
        scenes: Array<{ index: number; text: string }>;
        sceneCandidates: SceneClipCandidate[];
    }): Promise<SceneClipSelection[]> {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const { scenes, sceneCandidates } = params;
        if (!scenes?.length || !sceneCandidates?.length) return [];

        const candidateMap = new Map(sceneCandidates.map(c => [c.sceneIndex, c.clips]));

        const content: any[] = [
            {
                type: 'text',
                text:
                    `You are matching narration scenes to short silent video clips.\n` +
                    `For each scene you are given a narration sentence and numbered candidate clips. Each clip is represented by three preview frames sampled from that clip.\n` +
                    `Select the clip that best illustrates what is described — prefer clips that visually show the event, action, people, setting, or consequence mentioned in the narration.\n` +
                    `Return ONLY a JSON array with one entry per scene: [{ "sceneIndex": number, "clipIndex": number }]`,
            },
        ];

        for (const scene of scenes) {
            const clips = candidateMap.get(scene.index) ?? [];
            if (!clips.length) continue;

            content.push({ type: 'text', text: `\n--- Scene ${scene.index}: "${scene.text}" ---` });

            for (let ci = 0; ci < clips.length; ci++) {
                const clip = clips[ci];
                content.push({
                    type: 'text',
                    text: `Candidate clip ${ci} (start=${clip.start.toFixed(2)}s, duration=${clip.duration.toFixed(2)}s):`,
                });

                for (let pi = 0; pi < clip.previewFrames.length; pi++) {
                    const previewFrame = clip.previewFrames[pi];
                    try {
                        const base64 = fs.readFileSync(previewFrame.path).toString('base64');
                        content.push({
                            type: 'text',
                            text: `Preview ${pi} (t=${previewFrame.timestamp.toFixed(2)}s):`,
                        });
                        content.push({
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' },
                        });
                    } catch {
                        // skip unreadable preview frames silently
                    }
                }
            }
        }

        const messages = [
            { role: 'system', content: 'You select the best short silent clip for each narration scene.' },
            { role: 'user', content },
        ];

        try {
            const res = await axios.post(
                `${this.config.openAIApiBase}/v1/chat/completions`,
                { model: this.config.openAIVisionModel, messages, temperature: 0.1, max_tokens: 512 },
                { headers: { Authorization: `Bearer ${this.config.openAIApiKey}` } },
            );

            const raw: string = res.data?.choices?.[0]?.message?.content ?? '';
            const parsed: Array<{ sceneIndex: number; clipIndex: number }> = this._parseJsonArray(raw) ?? [];

            return parsed
                .map(({ sceneIndex, clipIndex }) => {
                    const clips = candidateMap.get(sceneIndex) ?? [];
                    const clip = clips[clipIndex] ?? clips[0];
                    if (!clip) return null;
                    return {
                        sceneIndex,
                        bestClipPath: clip.path,
                        bestStart: clip.start,
                        bestDuration: clip.duration,
                    };
                })
                .filter((r): r is SceneClipSelection => r !== null);
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.warn(`Vision clip selection failed (status ${status}): ${data ? JSON.stringify(data) : err?.message}`);
            return [];
        }
    }

    async detectPersistentLogoRegion(framePaths: string[]): Promise<LogoRegionDetection | null> {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');
        if (!framePaths?.length) return null;

        const content: any[] = [
            {
                type: 'text',
                text:
                    `You are detecting persistent channel branding overlays in news footage.\n` +
                    `Branding may include: channel logo icon, channel name text, watermark bug, and static corner/lower-third brand marks.\n` +
                    `Inspect all provided frames together and find the single consistent branding region if present.\n` +
                    `Return ONLY valid JSON in this exact shape: {"detected": boolean, "x": number, "y": number, "width": number, "height": number}.\n` +
                    `If no persistent branding exists, return {"detected": false, "x": 0, "y": 0, "width": 0, "height": 0}.\n` +
                    `If detected=true, x, y, width, and height must be normalized decimals between 0 and 1 and must cover BOTH logo icon and adjacent channel-name text where present.`,
            },
        ];

        for (let index = 0; index < framePaths.length; index++) {
            const framePath = framePaths[index];
            try {
                const base64 = fs.readFileSync(framePath).toString('base64');
                content.push({ type: 'text', text: `Frame ${index}:` });
                content.push({
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' },
                });
            } catch {
                // skip unreadable frames
            }
        }

        const messages = [
            { role: 'system', content: 'You detect persistent logos or watermarks in repeated frame samples.' },
            { role: 'user', content },
        ];

        try {
            const res = await axios.post(
                `${this.config.openAIApiBase}/v1/chat/completions`,
                { model: this.config.openAIVisionModel, messages, temperature: 0, max_tokens: 200 },
                { headers: { Authorization: `Bearer ${this.config.openAIApiKey}` } },
            );

            const raw: string = res.data?.choices?.[0]?.message?.content ?? '';
            const parsed = this._parseJsonObject(raw);
            if (!parsed || parsed.detected !== true) {
                return null;
            }

            const x = this._normalizeUnitInterval(parsed.x);
            const y = this._normalizeUnitInterval(parsed.y);
            const width = this._normalizeUnitInterval(parsed.width);
            const height = this._normalizeUnitInterval(parsed.height);

            if (width <= 0 || height <= 0) {
                return null;
            }

            return { detected: true, x, y, width, height };
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.warn(`Vision logo detection failed (status ${status}): ${data ? JSON.stringify(data) : err?.message}`);
            return null;
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

    private _parseJsonObject(content: string): any | null {
        if (!content) return null;
        try {
            const parsed = JSON.parse(content);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
        } catch {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start >= 0 && end >= 0) {
                try {
                    return JSON.parse(content.substring(start, end + 1));
                } catch {
                    return null;
                }
            }
            return null;
        }
    }

    private _normalizeUnitInterval(value: unknown): number {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
            return 0;
        }
        return Number(Math.max(0, Math.min(1, numericValue)).toFixed(4));
    }
}

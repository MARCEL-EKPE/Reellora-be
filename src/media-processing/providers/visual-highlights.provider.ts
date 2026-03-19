import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class VisualHighlightsProvider {
    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }

    async refineHighlightsWithVision(params: {
        transcript: any;
        candidates: Array<{ start: number; end: number; summary?: string }>;
        sampledFrames: Array<{ windowIndex: number; timestamp: number; path: string }>;
    }) {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const { transcript, candidates, sampledFrames } = params;

        if (!candidates?.length || !sampledFrames?.length) {
            return candidates || [];
        }

        const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);
        const transcriptExcerpt = transcriptText.slice(0, 4000);
        const framesForVision = sampledFrames.slice(0, 18);

        const content: any[] = [
            {
                type: 'text',
                text:
                    `You are refining highlight windows with visual evidence from sampled frames.\n` +
                    `Return ONLY a JSON array of highlight objects with keys: start, end, summary, visualScore.\n` +
                    `Rules:\n` +
                    `- Keep times grounded in candidate windows.\n` +
                    `- Prefer windows with stronger visual action/variety/clarity.\n` +
                    `- visualScore must be 1-10.\n` +
                    `- You may drop weak windows.\n\n` +
                    `Candidate windows:\n${JSON.stringify(candidates)}\n\n` +
                    `Transcript (truncated):\n${transcriptExcerpt}`,
            },
        ];

        for (const frame of framesForVision) {
            try {
                const img = fs.readFileSync(frame.path);
                const base64 = img.toString('base64');
                content.push({
                    type: 'text',
                    text: `Frame for windowIndex=${frame.windowIndex}, timestamp=${frame.timestamp.toFixed(2)}s`,
                });
                content.push({
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' },
                });
            } catch {
                // skip frames that can't be read
            }
        }

        const messages = [
            { role: 'system', content: 'You refine video highlights using transcript + frame evidence.' },
            { role: 'user', content },
        ];

        try {
            const res = await axios.post(
                `${this.config.openAIApiBase}/v1/chat/completions`,
                {
                    model: this.config.openAIVisionModel,
                    messages,
                    temperature: 0.2,
                    max_tokens: 1200,
                },
                {
                    headers: { Authorization: `Bearer ${this.config.openAIApiKey}` },
                }
            );

            const contentResult = res.data?.choices?.[0]?.message?.content;
            return this._parseJsonArray(contentResult) || candidates;
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            const details = data ? JSON.stringify(data) : err?.message;
            console.warn(`Vision refinement failed (status ${status}): ${details}`);
            return candidates;
        }
    }

    private _stringifyTranscript(transcript: any) {
        // If Whisper verbose JSON format, try to extract segments
        if (transcript && transcript.segments) {
            return transcript.segments.map((s: any) => `${s.start} --> ${s.end}: ${s.text}`).join('\n');
        }
        if (transcript && transcript.text) return transcript.text;
        return String(transcript);
    }

    private _parseJsonArray(content: string) {
        if (!content) return null;
        try {
            return JSON.parse(content);
        } catch {
            const start = content.indexOf('[');
            const end = content.lastIndexOf(']');
            if (start >= 0 && end >= 0) {
                const jsonPart = content.substring(start, end + 1);
                return JSON.parse(jsonPart);
            }
            return null;
        }
    }
}

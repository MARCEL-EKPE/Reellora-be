import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TranscriptSummaryProvider {
    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }

    async summarizeNewsTranscript(transcript: any) {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);

        const messages = [
            {
                role: 'system',
                content:
                    'You are an evidence-grounded news analyst. Separate facts from interpretation. Avoid partisan language. Surface uncertainty clearly.'
            },
            {
                role: 'user',
                content:
                    `Analyze the transcript and return ONLY valid JSON in this exact shape:\n` +
                    `{\n` +
                    `  "what_happened": string,\n` +
                    `  "key_points": string[],\n` +
                    `  "known_facts": string[],\n` +
                    `  "uncertainties": string[],\n` +
                    `  "context": string[],\n` +
                    `  "perspectives": [{ "view": string, "support": string[], "counter": string[] }],\n` +
                    `  "next_updates": [{ "prediction": string, "probability": number, "why": string, "triggers": string[] }],\n` +
                    `  "insufficient_evidence": boolean\n` +
                    `}\n\n` +
                    `Rules:\n` +
                    `- Start what_happened with this exact opener sentence: "5 minutes from now, you'll be smarter than 95% of people on today's world events — this is KnowIn5." Then continue with a concise, factual event summary.\n` +
                    `- Ground claims in transcript content only; do not invent facts.\n` +
                    `- Keep probability between 0 and 100.\n` +
                    `- Include at least one counter-view when evidence allows.\n` +
                    `- If transcript evidence is weak/short/unclear, set insufficient_evidence=true and reduce confidence.\n\n` +
                    `Transcript:\n${transcriptText}`,
            },
        ];

        const res = await axios.post(
            `${this.config.openAIApiBase}/v1/chat/completions`,
            {
                model: this.config.openAIChatModel,
                messages,
                temperature: 0.2,
                max_tokens: 1200,
            },
            {
                headers: { Authorization: `Bearer ${this.config.openAIApiKey}` },
            }
        );

        const content = res.data?.choices?.[0]?.message?.content;
        const parsed = this._parseJsonObject(content);
        if (!parsed) {
            throw new Error('Unable to parse model response as JSON object for transcript summary');
        }
        return parsed;
    }

    private _stringifyTranscript(transcript: any) {
        // If Whisper verbose JSON format, try to extract segments
        if (transcript && transcript.segments) {
            return transcript.segments.map((s: any) => `${s.start} --> ${s.end}: ${s.text}`).join('\n');
        }
        if (transcript && transcript.text) return transcript.text;
        return String(transcript);
    }

    private _parseJsonObject(content: string) {
        if (!content) return null;
        try {
            const parsed = JSON.parse(content);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start >= 0 && end >= 0) {
                const jsonPart = content.substring(start, end + 1);
                return JSON.parse(jsonPart);
            }
            return null;
        }
    }
}

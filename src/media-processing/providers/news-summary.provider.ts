import { Inject, Injectable, Logger } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NewsSummaryProvider {
    private readonly logger = new Logger(NewsSummaryProvider.name);

    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }

    async summarizeNewsTranscript(transcript: any) {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);

        // Validate transcript has meaningful content
        if (!transcriptText || transcriptText.trim().length < 10) {
            this.logger.warn('Transcript too short or empty; returning minimal summary');
            return this._getMinimalFallbackSummary('Insufficient video content for analysis.');
        }

        // Truncate to reasonable length to avoid token limit issues
        const maxCharacters = 8000;
        const trimmedTranscript = transcriptText.length > maxCharacters
            ? transcriptText.substring(0, maxCharacters) + '\n[... transcript truncated ...]'
            : transcriptText;

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
                    // `- Start what_happened with this exact opener sentence: "5 minutes from now, you'll be smarter than 95% of people on today's world events — this is KnowIn5." Then continue with a concise, factual event summary.\n` +
                    `- Ground claims in transcript content only; do not invent facts.\n` +
                    `- Keep probability between 0 and 100.\n` +
                    `- Include at least one counter-view when evidence allows.\n` +
                    `- If transcript evidence is weak/short/unclear, set insufficient_evidence=true and reduce confidence.\n\n` +
                    `Transcript:\n${trimmedTranscript}`,
            },
        ];

        try {
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
                this.logger.warn('Failed to parse OpenAI response as JSON; returning fallback summary');
                return this._getMinimalFallbackSummary(transcriptText.substring(0, 200));
            }
            return parsed;
        } catch (err: any) {
            const status = err?.response?.status;
            const errData = err?.response?.data;
            const errMessage = errData?.error?.message || err?.message || 'Unknown error';
            this.logger.error(
                `OpenAI summarization failed (status ${status}): ${errMessage}. Returning fallback summary.`
            );
            return this._getMinimalFallbackSummary(transcriptText.substring(0, 200));
        }
    }

    private _getMinimalFallbackSummary(snippet: string): any {
        return {
            what_happened: `5 minutes from now, you'll be smarter than 95% of people on today's world events — this is KnowIn5. ${snippet}`,
            key_points: ['Unable to fully analyze transcript.'],
            known_facts: [],
            uncertainties: ['Full analysis could not be completed.'],
            context: [],
            perspectives: [],
            next_updates: [],
            insufficient_evidence: true,
        };
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

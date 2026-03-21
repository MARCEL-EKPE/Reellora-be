import { Inject, Injectable, Logger } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TranscriptHighlightExtractorProvider {
    private readonly logger = new Logger(TranscriptHighlightExtractorProvider.name);

    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }

    async selectHighlights(transcript: any, maxHighlights?: number) {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        // Accept either a raw string transcript or Whisper verbose JSON
        const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);

        // Validate transcript has meaningful content
        if (!transcriptText || transcriptText.trim().length < 10) {
            this.logger.warn('Transcript too short or empty for highlight extraction; returning empty array');
            return [];
        }

        // Truncate to reasonable length to avoid token limit issues
        const maxCharacters = 8000;
        const trimmedTranscript = transcriptText.length > maxCharacters
            ? transcriptText.substring(0, maxCharacters) + '\n[... transcript truncated ...]'
            : transcriptText;

        const highlightLimitRule = typeof maxHighlights === 'number' && maxHighlights > 0
            ? `Identify up to ${maxHighlights} highlight segments suitable for short highlight clips.`
            : 'Identify all meaningful highlight segments suitable for short highlight clips. Do not force a fixed number.';

        const prompt = `You are given a transcript of a video with timestamps. ${highlightLimitRule} Reply ONLY with a JSON array of objects with keys: start (seconds float), end (seconds float), summary (short text). Do not include any extra explanation.`;

        const messages = [
            { role: 'system', content: 'You extract highlight timestamps from transcripts.' },
            { role: 'user', content: `${prompt}\n\nTranscript:\n${trimmedTranscript}` },
        ];

        try {
            const res = await axios.post(
                `${this.config.openAIApiBase}/v1/chat/completions`,
                {
                    model: this.config.openAIChatModel,
                    messages,
                    temperature: 0.2,
                    max_tokens: 800,
                },
                {
                    headers: { Authorization: `Bearer ${this.config.openAIApiKey}` },
                }
            );

            const content = res.data?.choices?.[0]?.message?.content;
            try {
                const parsed = JSON.parse(content);
                return Array.isArray(parsed) ? parsed : [];
            } catch (parseErr) {
                // fallback: try to extract JSON substring
                const start = content.indexOf('[');
                const end = content.lastIndexOf(']');
                if (start >= 0 && end >= 0) {
                    try {
                        const jsonPart = content.substring(start, end + 1);
                        const parsed = JSON.parse(jsonPart);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        this.logger.warn('Failed to extract JSON from response; returning empty highlights');
                        return [];
                    }
                }
                this.logger.warn('Unable to parse highlight response as JSON; returning empty array');
                return [];
            }
        } catch (err: any) {
            const status = err?.response?.status;
            const errData = err?.response?.data;
            const errMessage = errData?.error?.message || err?.message || 'Unknown error';
            this.logger.error(
                `OpenAI highlight extraction failed (status ${status}): ${errMessage}. Returning empty highlights.`
            );
            return [];
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
}

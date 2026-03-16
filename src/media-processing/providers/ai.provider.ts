import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class AiProvider {

  constructor(

    @Inject(mediaProcessingConfig.KEY)
    private readonly config: ConfigType<typeof mediaProcessingConfig>
  ) { }


  async selectHighlights(transcript: any, maxHighlights?: number) {
    if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

    // Accept either a raw string transcript or Whisper verbose JSON
    const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);

    const highlightLimitRule = typeof maxHighlights === 'number' && maxHighlights > 0
      ? `Identify up to ${maxHighlights} highlight segments suitable for short highlight clips.`
      : 'Identify all meaningful highlight segments suitable for short highlight clips. Do not force a fixed number.';

    const prompt = `You are given a transcript of a video with timestamps. ${highlightLimitRule} Reply ONLY with a JSON array of objects with keys: start (seconds float), end (seconds float), summary (short text). Do not include any extra explanation.`;

    const messages = [
      { role: 'system', content: 'You extract highlight timestamps from transcripts.' },
      { role: 'user', content: `${prompt}\n\nTranscript:\n${transcriptText}` },
    ];

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
      return parsed;
    } catch (err) {
      // fallback: try to extract JSON substring
      const start = content.indexOf('[');
      const end = content.lastIndexOf(']');
      if (start >= 0 && end >= 0) {
        const jsonPart = content.substring(start, end + 1);
        return JSON.parse(jsonPart);
      }
      throw new Error('Unable to parse model response as JSON');
    }
  }

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

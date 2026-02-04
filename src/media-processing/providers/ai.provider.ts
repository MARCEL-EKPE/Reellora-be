import { Inject, Injectable } from '@nestjs/common';
import mediaProcessingConfig from '../config/media-processing.config';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiProvider {

  constructor(

    @Inject(mediaProcessingConfig.KEY)
    private readonly config: ConfigType<typeof mediaProcessingConfig>
  ) { }


  async selectHighlights(transcript: any, maxHighlights = 5) {
    if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

    // Accept either a raw string transcript or Whisper verbose JSON
    const transcriptText = typeof transcript === 'string' ? transcript : this._stringifyTranscript(transcript);

    const prompt = `You are given a transcript of a video with timestamps. Identify up to ${maxHighlights} highlight segments suitable for short highlight clips. Reply ONLY with a JSON array of objects with keys: start (seconds float), end (seconds float), summary (short text). Do not include any extra explanation.`;

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

  private _stringifyTranscript(transcript: any) {
    // If Whisper verbose JSON format, try to extract segments
    if (transcript && transcript.segments) {
      return transcript.segments.map((s: any) => `${s.start} --> ${s.end}: ${s.text}`).join('\n');
    }
    if (transcript && transcript.text) return transcript.text;
    return String(transcript);
  }
}

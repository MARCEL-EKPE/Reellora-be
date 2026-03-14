import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiHeadlineAnalysisProvider {

    constructor(
        private configService: ConfigService
    ) { }

    async scoreHeadline(title: string): Promise<number> {
        if (!this.configService.get('OPENAI_API_KEY')) {
            throw new Error('OPENAI_API_KEY is not set');
        }

        const openAiBaseUrl =
            this.configService.get<string>('OPENAI_API_BASE_URL') ||
            this.configService.get<string>('OPENAI_API_BASE') ||
            'https://api.openai.com';

        const prompt = `
You are a senior global news editor.

Score the following headline from 0 to 10 based on how important it is as real breaking or impactful news.

Scoring rules:
- 8–10: Major geopolitical, military, economic crisis, elections, global impact.
- 6–7: Important national or regional developments.
- 4–5: Minor updates or less impactful stories.
- 0–3: TV programs, talk shows, interviews, analysis segments, opinion, feature stories.

Programs like:
"Inside Story", "Dateline", "Talk to Al Jazeera", "#Shorts", etc.
must score between 0–3.

Return ONLY valid JSON:
{ "score": number }

Headline:
"${title}"`;

        const res = await axios.post(
            `${openAiBaseUrl}/v1/chat/completions`,
            {
                model: this.configService.get('OPENAI_CHAT_MODEL'),
                messages: [
                    { role: 'system', content: 'You are an expert global newsroom editor.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.1,
                max_tokens: 50,
            },
            {
                headers: {
                    Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
                },
            }
        );

        const content = res.data?.choices?.[0]?.message?.content;

        try {
            const parsed = JSON.parse(content);
            return parsed.score ?? 0;
        } catch {
            const start = content.indexOf('{');
            const end = content.lastIndexOf('}');
            if (start >= 0 && end >= 0) {
                const jsonPart = content.substring(start, end + 1);
                return JSON.parse(jsonPart).score ?? 0;
            }
            throw new Error('Unable to parse headline score');
        }
    }

}

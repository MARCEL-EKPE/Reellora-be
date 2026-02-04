import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import mediaProcessingConfig from '../config/media-processing.config';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
@Injectable()
export class TranscriptionProvider {

    constructor(

        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }



    async transcribe(filePath: string, model = 'whisper-1') {
        if (!this.config.openAIApiKey) throw new Error('OPENAI_API_KEY is not set');

        const stream = fs.createReadStream(filePath);
        const form = new FormData();
        form.append('file', stream);
        form.append('model', model);
        // verbose_json returns timestamps and word-level info when available
        form.append('response_format', 'verbose_json');

        const headers = {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.config.openAIApiKey}`,
        };

        const url = `${this.config.openAIApiBase}/v1/audio/transcriptions`;
        try {
            const res = await axios.post(url, form, { headers, maxBodyLength: Infinity });
            return res.data;
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            const requestId = err?.response?.headers?.['x-request-id'];
            const fileSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : undefined;
            throw new Error(
                `OpenAI transcription failed` +
                (status ? ` (status ${status})` : '') +
                (requestId ? `, requestId=${requestId}` : '') +
                (fileSize ? `, fileSize=${fileSize}` : '') +
                (data ? `, response=${JSON.stringify(data)}` : '')
            );
        }
    }
}

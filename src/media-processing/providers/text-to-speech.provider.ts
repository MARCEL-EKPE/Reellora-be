import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { TextToSpeechModel, TextToSpeechVoice, AudioFormat } from "../enums/text-to-speech.enum";
import { GenerateSpeechRequest, GenerateSpeechResponse } from '../interfaces/text-to-speech.interface';
import { type ConfigType } from '@nestjs/config';
import mediaProcessingConfig from '../config/media-processing.config';

@Injectable()
export class TextToSpeechProvider {
    private readonly logger = new Logger(TextToSpeechProvider.name);

    constructor(

        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>
    ) { }


    async generateSpeech(request: GenerateSpeechRequest): Promise<GenerateSpeechResponse> {
        const {
            transcriptPath,
            outputPath,
            voice = TextToSpeechVoice.CEDAR,
            model = TextToSpeechModel.GPT_4O_MINI_TTS,
            speed = 1.0,
            response_format = AudioFormat.WAV,
        } = request;


        if (!this.config.openAIApiKey) {
            throw new BadRequestException('OPENAI_API_KEY is not configured');
        }

        try {
            this.logger.log(
                `Generating speech from transcript: ${path.basename(transcriptPath)}`,
            );

            // Call OpenAI TTS API
            const response = await axios.post(
                `${this.config.openAIApiBase}/v1/audio/speech`,
                {
                    model,
                    voice,
                    input: fs.readFileSync(transcriptPath, 'utf-8'),
                    speed,
                    response_format,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.config.openAIApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                },
            );

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write audio to file
            const audioBuffer = Buffer.from(response.data);
            await fs.promises.writeFile(outputPath, audioBuffer);

            this.logger.log(
                `Audio generated successfully: ${path.basename(outputPath)} (${audioBuffer.length} bytes)`,
            );

            return {
                audioPath: outputPath,
                size: audioBuffer.length,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data?.error?.message ||
                    error.message ||
                    'Failed to generate speech';
                this.logger.error(`OpenAI TTS API Error: ${errorMessage}`);
                throw new BadRequestException(`TTS API Error: ${errorMessage}`);
            }
            this.logger.error(`Unexpected error: ${error.message}`);
            throw error;
        }
    }

}
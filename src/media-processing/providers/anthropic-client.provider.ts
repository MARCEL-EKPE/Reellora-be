import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import { type ConfigType } from '@nestjs/config';
import mediaProcessingConfig from '../config/media-processing.config';

export interface AnthropicCompletionRequest {
    system: string;
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

/**
 * Thin wrapper around Anthropic's Messages API.
 * Shared by the intelligence layer and the script generator so both
 * stages talk to Claude the same way (auth, error handling, parsing).
 */
@Injectable()
export class AnthropicClientProvider {
    private readonly logger = new Logger(AnthropicClientProvider.name);

    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>,
    ) { }

    async complete(request: AnthropicCompletionRequest): Promise<string> {
        const { system, prompt, maxTokens = 2048, temperature = 0.7 } = request;

        if (!this.config.anthropicApiKey) {
            throw new BadRequestException('ANTHROPIC_API_KEY is not configured');
        }

        try {
            const response = await axios.post(
                `${this.config.anthropicApiBase}/v1/messages`,
                {
                    model: this.config.anthropicModel,
                    max_tokens: maxTokens,
                    temperature,
                    system,
                    messages: [{ role: 'user', content: prompt }],
                },
                {
                    headers: {
                        'x-api-key': this.config.anthropicApiKey,
                        'anthropic-version': this.config.anthropicApiVersion,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const text = response.data?.content?.[0]?.text;
            if (!text) {
                throw new BadRequestException('Anthropic API returned an empty response');
            }
            return text;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data?.error?.message ||
                    error.message ||
                    'Failed to call Anthropic API';
                this.logger.error(`Anthropic API Error: ${errorMessage}`);
                throw new BadRequestException(`Anthropic API Error: ${errorMessage}`);
            }
            this.logger.error(`Unexpected error calling Anthropic API: ${error.message}`);
            throw error;
        }
    }
}

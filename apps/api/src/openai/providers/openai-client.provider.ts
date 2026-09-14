import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import axios from 'axios';
import { type ConfigType } from '@nestjs/config';
import openaiConfig from '../config/openai.config';
import type {
  OpenAiCompletionRequest,
  OpenAiCompletionResponse,
} from '../interfaces/openai-completion.interface';

@Injectable()
export class OpenAiClientProvider {
  private readonly logger = new Logger(OpenAiClientProvider.name);

  constructor(
    @Inject(openaiConfig.KEY)
    private readonly config: ConfigType<typeof openaiConfig>,
  ) {}

  async complete(
    request: OpenAiCompletionRequest,
  ): Promise<OpenAiCompletionResponse> {
    const {
      system,
      prompt,
      model,
      maxTokens = 2048,
      temperature = 0.7,
      jsonMode = false,
    } = request;

    if (!this.config.apiKey) {
      throw new BadRequestException('OPENAI_API_KEY is not configured');
    }

    try {
      const response = await axios.post(
        `${this.config.apiBase}/v1/chat/completions`,
        {
          model: model || this.config.chatModel,
          max_tokens: maxTokens,
          temperature,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new BadRequestException('OpenAI API returned an empty response');
      }

      return { text };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          'Failed to call OpenAI API';
        this.logger.error(`OpenAI API Error: ${errorMessage}`);
        throw new BadRequestException(`OpenAI API Error: ${errorMessage}`);
      }
      this.logger.error(
        `Unexpected error calling OpenAI API: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}

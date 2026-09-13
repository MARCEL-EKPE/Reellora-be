import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './config/openai.config';
import { OpenAiClientProvider } from './providers/openai-client.provider';

@Module({
    imports: [ConfigModule.forFeature(openaiConfig)],
    providers: [OpenAiClientProvider],
    exports: [OpenAiClientProvider],
})
export class OpenAiModule { }

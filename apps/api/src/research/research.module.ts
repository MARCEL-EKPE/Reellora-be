import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiModule } from '../openai/openai.module';
import researchConfig from './config/research.config';
import { ResearchProvider } from './providers/research.provider';

@Module({
    imports: [ConfigModule.forFeature(researchConfig), OpenAiModule],
    providers: [ResearchProvider],
    exports: [ResearchProvider],
})
export class ResearchModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import researchConfig from './config/research.config';
import { ResearchProvider } from './providers/research.provider';

@Module({
    imports: [ConfigModule.forFeature(researchConfig)],
    providers: [ResearchProvider],
    exports: [ResearchProvider],
})
export class ResearchModule {}

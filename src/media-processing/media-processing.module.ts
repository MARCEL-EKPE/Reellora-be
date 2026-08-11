import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mediaProcessingConfig from './config/media-processing.config';
import { TextToSpeechProvider } from './providers/text-to-speech.provider';
import { AnthropicClientProvider } from './providers/anthropic-client.provider';
import { ContentIntelligenceProvider } from './providers/content-intelligence.provider';
import { ContentScriptGeneratorProvider } from './providers/content-script-generator.provider';
import { ContentAssemblyProvider } from './providers/content-assembly.provider';
import { ContentPipelineOrchestratorService } from './providers/content-pipeline-orchestrator.service';
import { ContentIngestionModule } from '../content-ingestion/content-ingestion.module';

@Module({
  imports: [
    ConfigModule.forFeature(mediaProcessingConfig),
    ContentIngestionModule,
  ],
  providers: [
    ContentPipelineOrchestratorService,
    AnthropicClientProvider,
    ContentIntelligenceProvider,
    ContentScriptGeneratorProvider,
    ContentAssemblyProvider,
    TextToSpeechProvider,
  ],
  exports: [ContentPipelineOrchestratorService, TextToSpeechProvider],
})
export class MediaProcessingModule { }

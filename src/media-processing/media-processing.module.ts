import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mediaProcessingConfig from './config/media-processing.config';
import { TextToSpeechProvider } from './providers/text-to-speech.provider';
import { ContentScriptGeneratorProvider } from './providers/content-script-generator.provider';
import { ContentAssemblyProvider } from './providers/content-assembly.provider';
import { ContentPipelineOrchestratorService } from './providers/content-pipeline-orchestrator.service';

@Module({
  imports: [
    ConfigModule.forFeature(mediaProcessingConfig),
  ],
  providers: [
    ContentPipelineOrchestratorService,
    ContentScriptGeneratorProvider,
    ContentAssemblyProvider,
    TextToSpeechProvider,
  ],
  exports: [ContentPipelineOrchestratorService, TextToSpeechProvider],
})
export class MediaProcessingModule { }

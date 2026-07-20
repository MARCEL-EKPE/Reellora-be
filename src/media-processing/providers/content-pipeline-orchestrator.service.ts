import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ContentPipelineRequest, ContentPipelineResult } from '../interfaces/content-pipeline.interface';
import { ContentScriptGeneratorProvider } from './content-script-generator.provider';
import { ContentAssemblyProvider } from './content-assembly.provider';
import { TextToSpeechProvider } from './text-to-speech.provider';

@Injectable()
export class ContentPipelineOrchestratorService {
    private readonly logger = new Logger(ContentPipelineOrchestratorService.name);

    constructor(
        private readonly scriptGeneratorProvider: ContentScriptGeneratorProvider,
        private readonly textToSpeechProvider: TextToSpeechProvider,
        private readonly contentAssemblyProvider: ContentAssemblyProvider,
    ) { }

    async runPipeline(request: ContentPipelineRequest): Promise<ContentPipelineResult> {
        const outputDir = path.resolve(request.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const script = await this.scriptGeneratorProvider.generateScript(request);
        const transcriptPath = path.join(outputDir, 'script.txt');
        const audioPath = path.join(outputDir, 'narration.mp3');
        const videoPath = path.join(outputDir, 'final-video.mp4');

        fs.writeFileSync(transcriptPath, script, 'utf8');

        const speechResult = await this.textToSpeechProvider.generateSpeech({
            transcriptPath,
            outputPath: audioPath,
            voice: request.voice,
            model: request.model,
            speed: request.speed,
        });

        const assembledVideoPath = await this.contentAssemblyProvider.assembleNarrationVideo({
            outputPath: videoPath,
            audioPath: speechResult.audioPath,
            titleText: request.topic,
            script,
        });

        this.logger.log(`Content pipeline completed for ${request.topic}`);

        return {
            script,
            audioPath: speechResult.audioPath,
            videoPath: assembledVideoPath,
            outputDir,
        };
    }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ContentPipelineRequest, ContentPipelineResult } from '../interfaces/content-pipeline.interface';
import { ContentScriptGeneratorProvider } from './content-script-generator.provider';
import { ContentIntelligenceProvider } from './content-intelligence.provider';
import { ContentAssemblyProvider } from './content-assembly.provider';
import { TextToSpeechProvider } from './text-to-speech.provider';
import { ContentIngestionService } from '../../content-ingestion/providers/content-ingestion.service';

@Injectable()
export class ContentPipelineOrchestratorService implements OnModuleInit {
    private readonly logger = new Logger(ContentPipelineOrchestratorService.name);

    constructor(
        private readonly contentIntelligenceProvider: ContentIntelligenceProvider,
        private readonly scriptGeneratorProvider: ContentScriptGeneratorProvider,
        private readonly textToSpeechProvider: TextToSpeechProvider,
        private readonly contentAssemblyProvider: ContentAssemblyProvider,
        private readonly contentIngestionService: ContentIngestionService,
    ) { }

    async onModuleInit() {
        await this.logAvailableFeeds();
    }

    private async logAvailableFeeds() {
        try {
            this.logger.log('📡 Initializing content feeds from ingestion layer...');
            const feeds = await this.contentIngestionService.discoverFeeds();
            this.logger.log(`✅ Successfully fetched ${feeds.length} feed items`);
            console.log('\n════════════════════════════════════════════');
            console.log('   📰 AVAILABLE CONTENT FEEDS - INGESTION PIPELINE');
            console.log('════════════════════════════════════════════');
            console.log(`Total items ingested: ${feeds.length}\n`);
            feeds.forEach((feed, index) => {
                console.log(`[${index + 1}] ${feed.title}`);
                console.log(`    📍 Source: ${feed.source}`);
                console.log(`    🕐 Published: ${feed.publishedAt || 'N/A'}`);
                console.log(`    🔗 URL: ${feed.url || 'N/A'}`);
                console.log(`    📝 Summary: ${feed.summary?.substring(0, 100)}...`);
                console.log('');
            });
            console.log('════════════════════════════════════════════\n');
        } catch (error) {
            this.logger.error('❌ Failed to load feeds from ingestion pipeline:', error);
            console.error('Error details:', error);
        }
    }

    async runPipeline(request: ContentPipelineRequest): Promise<ContentPipelineResult> {
        const outputDir = path.resolve(request.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const sourceItems = request.sourceItems ?? (await this.contentIngestionService.discoverFeeds());
        const brief = await this.contentIntelligenceProvider.buildBrief(sourceItems, request.topic);
        const script = await this.scriptGeneratorProvider.generateScript(brief);

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
            titleText: brief.topic,
            script,
        });

        this.logger.log(`Content pipeline completed for ${brief.topic}`);

        return {
            script,
            audioPath: speechResult.audioPath,
            videoPath: assembledVideoPath,
            outputDir,
        };
    }
}

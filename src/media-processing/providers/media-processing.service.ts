import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // Commented out for testing
import * as path from 'path';
import { VideoSourceProvider, SourcedVideoMetadata } from './video-source.provider';
import { VideoUploadProvider } from './video-upload.provider';
import { videoQueue } from '../queues/video.queue';
import IORedis from 'ioredis';
import { QueueEvents } from 'bullmq';
import * as fs from 'fs';
import { MediaScrapperService } from 'src/media-scrapper/providers/media-scrapper.service';

@Injectable()
export class MediaProcessingService implements OnModuleInit {
    private readonly logger = new Logger(MediaProcessingService.name);
    private readonly baseDir = path.join(process.cwd(), 'videos');

    constructor(
        private readonly mediaScrapperService: MediaScrapperService,
        private readonly videoSourceProvider: VideoSourceProvider,
        private readonly videoUploadProvider: VideoUploadProvider,
    ) { }


    async onModuleInit() {
        // this.logger.log('🔧 MediaProcessingModule initialized - Starting automated processing...');
        setTimeout(() => {

            this.automateHighlightGeneration().catch(err => {
                this.logger.error(`Failed to run initial processing: ${err.message}`);
            });

        }, 20000);
    }

    /**
     * ===== CRON ENTRY POINTS =====
     * These are triggered by schedule; they kick off the entire orchestration
     * NOTE: @Cron decorator commented out for testing - using OnModuleInit instead
     * Uncomment @Cron decorator for production use
     */

    // @Cron('0 */12 * * *') // Every 12 hours (production)
    // @Cron('*/30 * * * * *') // Every 30 seconds (testing)
    async automateHighlightGeneration() {
        this.logger.log('🚀 ===== AUTOMATED HIGHLIGHT GENERATION STARTED =====');
        try {
            const feedUrls = await this.mediaScrapperService.discoverFeeds();

            if (!feedUrls?.length) {
                this.logger.warn('⚠️ No feed URLs discovered for this automation cycle.');
                return;
            }

            this.logger.log(`📰 Discovered ${feedUrls.length} feed URL(s) to process.`);

            for (const feedUrl of feedUrls) {
                try {
                    this.logger.log(`▶️ Starting pipeline for: ${feedUrl}`);
                    await this.fullProcessingPipeline(feedUrl, { uploadToYouTube: false });
                } catch (err) {
                    this.logger.error(`❌ Failed processing feed URL ${feedUrl}: ${err.message}`);
                }
            }

            this.logger.log('✅ ===== AUTOMATION CYCLE COMPLETED =====');
        } catch (err) {
            this.logger.error(`❌ ===== AUTOMATION FAILED: ${err.message} =====`);
        }
    }


    /**
     * ===== MAIN ORCHESTRATION PIPELINE =====
     * The complete flow: Download → Extract → Transcribe → Analyze → Cut → Merge → Watermark → Upload
     */

    private async fullProcessingPipeline(sourceUrl: string, options?: { uploadToYouTube?: boolean }): Promise<any> {
        let sourceMeta: SourcedVideoMetadata;
        let sessionId = Date.now();

        try {
            // Step 1: Download video
            this.logger.log(`[${sessionId}] 📥 STEP 1: Downloading video...`);
            sourceMeta = await this._downloadVideo(sourceUrl);
            this.logger.log(`[${sessionId}] ✅ Downloaded: ${path.basename(sourceMeta.downloadPath)}`);

            // Step 2: Process video (extract, transcribe, analyze, cut, merge)
            this.logger.log(`[${sessionId}] 🎬 STEP 2: Processing video (audio extraction → transcription → highlight analysis)...`);
            const processResult = await this._processVideo(sourceMeta.downloadPath, sessionId);
            this.logger.log(`[${sessionId}] ✅ Processing complete: ${path.basename(processResult.finalOutput)}`);

            return processResult;
        } catch (err) {
            this.logger.error(`[${sessionId}] ❌ Pipeline failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * ===== STEP 1: DOWNLOAD VIDEO =====
     */

    private async _downloadVideo(sourceUrl: string): Promise<SourcedVideoMetadata> {
        try {
            const metadata = await this.videoSourceProvider.downloadYouTubeVideo(sourceUrl, this.baseDir);
            return metadata;
        } catch (err) {
            throw new Error(`Download failed: ${err.message}`);
        }
    }

    /**
     * ===== STEP 2: PROCESS VIDEO =====
     * Orchestrates: Extract Audio → Transcribe → Analyze → Cut → Merge → Watermark
     */

    private async _processVideo(videoPath: string, sessionId: number): Promise<any> {
        const sessionDir = path.join(this.baseDir, `session-${sessionId}`);
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

        const audioPath = path.join(sessionDir, 'audio.wav');
        const transcriptPath = path.join(sessionDir, 'transcript.json');
        const transcriptTextPath = path.join(sessionDir, 'transcript.txt');
        const highlightsPath = path.join(sessionDir, 'highlights.json');
        const clipsDir = path.join(sessionDir, 'clips');
        const mergedPath = path.join(sessionDir, 'merged.mp4');
        const mergedWithTtsPath = path.join(sessionDir, 'merged-tts.mp4');
        const ttsAudioPath = path.join(sessionDir, 'tts-audio.mp3');
        const finalOutput = path.join(sessionDir, 'final-highlight.mp4');
        const logo = path.join(this.baseDir, 'logo.jpg');

        if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });

        const connection = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });
        const queueEvents = new QueueEvents('video-processing', { connection });

        try {
            // 2.1: Extract audio
            this.logger.debug(`[${sessionId}] 2.1 Extracting audio...`);
            await this._executeQueueJob('extract-audio', { input: videoPath, output: audioPath, format: 'wav' }, queueEvents, sessionId);

            // 2.1.5: Compress audio (to comply with OpenAI's 25MB limit)
            this.logger.debug(`[${sessionId}] 2.1.5 Compressing audio...`);
            const compressedAudioPath = path.join(sessionDir, 'audio-compressed.mp3');
            await this._executeQueueJob('compress-audio', { input: audioPath, output: compressedAudioPath, bitrate: '64k' }, queueEvents, sessionId);

            // 2.2: Transcribe audio
            this.logger.debug(`[${sessionId}] 2.2 Transcribing audio...`);
            await this._executeQueueJob('transcribe-audio', { input: compressedAudioPath, outputPath: transcriptPath, model: 'whisper-1' }, queueEvents, sessionId);

            // 2.3: Analyze highlights
            this.logger.debug(`[${sessionId}] 2.3 Analyzing highlights...`);
            const highlightsResult = await this._executeQueueJob('analyze-highlights', { transcriptPath, outputPath: highlightsPath, maxHighlights: 6 }, queueEvents, sessionId);

            let highlights = highlightsResult;
            if (!highlights || highlights.length === 0) {
                const raw = fs.readFileSync(highlightsPath, 'utf-8');
                highlights = JSON.parse(raw);
            }
            this.logger.debug(`[${sessionId}] Found ${highlights.length} highlight segments`);

            // 2.4: Cut highlight segments
            this.logger.debug(`[${sessionId}] 2.4 Cutting ${highlights.length} highlight segments...`);
            const clipPaths: string[] = [];
            for (let i = 0; i < highlights.length; i++) {
                const h = highlights[i];
                const start = h.start;
                const end = h.end;
                const duration = Math.max(0.5, end - start);
                const clipPath = path.join(clipsDir, `clip-${i}.mp4`);
                await this._executeQueueJob('cut-segment', { input: videoPath, output: clipPath, start, duration }, queueEvents, sessionId);
                clipPaths.push(clipPath);
            }

            // 2.5: Merge clips
            this.logger.debug(`[${sessionId}] 2.5 Merging clips...`);
            await this._executeQueueJob('merge-videos', { inputs: clipPaths, output: mergedPath }, queueEvents, sessionId);

            // 2.5.5: Generate TTS from highlight transcript segments only
            this.logger.debug(`[${sessionId}] 2.5.5 Generating TTS audio from highlight segments...`);
            const transcriptRaw = fs.readFileSync(transcriptPath, 'utf-8');
            const transcriptJson = JSON.parse(transcriptRaw);
            const transcriptSegments: Array<{ start: number; end: number; text: string }> = transcriptJson?.segments ?? [];
            const highlightText = highlights
                .map((h: any) =>
                    transcriptSegments
                        .filter(seg => seg.start < h.end && seg.end > h.start)
                        .map(seg => seg.text.trim())
                        .join(' ')
                )
                .join(' ')
                .trim();
            const ttsText = highlightText || transcriptJson?.text || '';
            fs.writeFileSync(transcriptTextPath, ttsText);
            await this._executeQueueJob(
                'generate-tts',
                { transcriptPath: transcriptTextPath, outputPath: ttsAudioPath, response_format: 'mp3' },
                queueEvents,
                sessionId
            );

            // 2.6: Replace merged video audio with TTS
            this.logger.debug(`[${sessionId}] 2.6 Replacing audio with TTS...`);
            await this._executeQueueJob('replace-audio', { inputVideo: mergedPath, inputAudio: ttsAudioPath, output: mergedWithTtsPath }, queueEvents, sessionId);

            // 2.7: Add watermark
            this.logger.debug(`[${sessionId}] 2.7 Adding watermark...`);
            await this._executeQueueJob('add-watermark', { input: mergedWithTtsPath, output: finalOutput, logoPath: logo }, queueEvents, sessionId);

            return { videoPath, audioPath, transcriptPath, highlightsPath, clipsDir, mergedPath, finalOutput, highlights };
        } finally {
            await queueEvents.close();
            await connection.disconnect();
        }
    }

    /**
     * ===== HELPER: QUEUE JOB EXECUTION =====
     */

    private async _executeQueueJob(jobName: string, jobData: any, queueEvents: QueueEvents, sessionId: number): Promise<any> {
        try {
            const job = await videoQueue.add(jobName, jobData);
            const result = await job.waitUntilFinished(queueEvents);
            this.logger.debug(`[${sessionId}] ✓ Job "${jobName}" completed`);
            return result;
        } catch (err) {
            throw new Error(`Job "${jobName}" failed: ${err.message}`);
        }
    }
}

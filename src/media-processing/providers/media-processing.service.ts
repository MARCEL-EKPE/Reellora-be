import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // Commented out for testing
import * as path from 'path';
import { VideoSourceProvider, SourcedVideoMetadata } from './video-source.provider';
import { Queue, QueueEvents } from 'bullmq';
import * as fs from 'fs';
import { MediaScrapperService } from 'src/media-scrapper/providers/media-scrapper.service';
import { InjectQueue } from '@nestjs/bullmq';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class MediaProcessingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MediaProcessingService.name);
    private readonly baseDir = path.join(process.cwd(), 'videos');
    private readonly queueEvents: QueueEvents;

    constructor(
        @InjectQueue('video-processing')
        private readonly videoQueue: Queue,
        private readonly redisService: RedisService,
        private readonly mediaScrapperService: MediaScrapperService,
        private readonly videoSourceProvider: VideoSourceProvider,
    ) {
        this.queueEvents = new QueueEvents('video-processing', {
            connection: this.videoQueue.opts.connection,
        });
    }


    async onModuleInit() {
        // this.logger.log('🔧 MediaProcessingModule initialized - Starting automated processing...');
        setTimeout(() => {

            this.automateHighlightGeneration().catch(err => {
                this.logger.error(`Failed to run initial processing: ${err.message}`);
            });

        }, 20000);
    }

    async onModuleDestroy() {
        await this.queueEvents.close();
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
                const keySuffix = encodeURIComponent(feedUrl);
                const processedKey = `media-processing:processed:${keySuffix}`;
                const lockKey = `media-processing:lock:${keySuffix}`;

                try {
                    const alreadyProcessed = await this.redisService.client.exists(processedKey);
                    if (alreadyProcessed) {
                        this.logger.debug(`⏭️ Skipping already processed feed URL: ${feedUrl}`);
                        continue;
                    }

                    const lockAcquired = await this.redisService.client.set(lockKey, '1', 'EX', 1800, 'NX');
                    if (!lockAcquired) {
                        this.logger.debug(`🔒 Feed URL is already being processed by another worker: ${feedUrl}`);
                        continue;
                    }

                    this.logger.log(`▶️ Starting pipeline for: ${feedUrl}`);
                    await this.fullProcessingPipeline(feedUrl, { uploadToYouTube: false });
                    await this.redisService.client.setex(processedKey, 86400, '1');
                } catch (err) {
                    this.logger.error(`❌ Failed processing feed URL ${feedUrl}: ${err.message}`);
                } finally {
                    await this.redisService.client.del(lockKey);
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
        const summaryPath = path.join(sessionDir, 'news-summary.json');
        const highlightsPath = path.join(sessionDir, 'highlights.json');
        const refinedHighlightsPath = path.join(sessionDir, 'highlights-refined.json');
        const clipsDir = path.join(sessionDir, 'clips');
        const framesDir = path.join(sessionDir, 'frames');
        const mergedPath = path.join(sessionDir, 'merged.mp4');
        const mergedWithTtsPath = path.join(sessionDir, 'merged-tts.mp4');
        const ttsAudioPath = path.join(sessionDir, 'tts-audio.mp3');
        const finalOutput = path.join(sessionDir, 'final-highlight.mp4');
        const logo = path.join(this.baseDir, 'logo.jpg');

        if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
        if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

        // 2.1: Extract audio
        this.logger.debug(`[${sessionId}] 2.1 Extracting audio...`);
        await this._executeQueueJob('extract-audio', { input: videoPath, output: audioPath, format: 'wav' }, sessionId);


        // 2.1.5: Compress audio (to comply with OpenAI's 25MB limit)
        this.logger.debug(`[${sessionId}] 2.1.5 Compressing audio...`);
        const compressedAudioPath = path.join(sessionDir, 'audio-compressed.mp3');
        await this._executeQueueJob('compress-audio', { input: audioPath, output: compressedAudioPath, bitrate: '64k' }, sessionId);


        // 2.2: Transcribe audio
        this.logger.debug(`[${sessionId}] 2.2 Transcribing audio...`);
        await this._executeQueueJob('transcribe-audio', { input: compressedAudioPath, outputPath: transcriptPath, model: 'whisper-1' }, sessionId);

        // 2.2.5: Generate transcript-based news summary
        this.logger.debug(`[${sessionId}] 2.2.5 Generating transcript summary...`);
        await this._executeQueueJob('summarize-news', { transcriptPath, outputPath: summaryPath }, sessionId);


        // 2.3: Analyze highlights
        this.logger.debug(`[${sessionId}] 2.3 Analyzing highlights...`);
        const highlightsResult = await this._executeQueueJob('analyze-highlights', { transcriptPath, outputPath: highlightsPath }, sessionId);

        let highlights = highlightsResult;
        if (!highlights || highlights.length === 0) {
            const raw = fs.readFileSync(highlightsPath, 'utf-8');
            highlights = JSON.parse(raw);
        }
        this.logger.debug(`[${sessionId}] Found ${highlights.length} highlight segments`);

        // 2.3.5: Refine highlight windows using sampled frames + vision model
        const sampledFrames: Array<{ windowIndex: number; timestamp: number; path: string }> = [];
        const maxFramesPerWindow = 3;
        const minFrameGapSeconds = 2.0;
        const maxTotalSampledFrames = 24;

        for (let i = 0; i < highlights.length; i++) {
            if (sampledFrames.length >= maxTotalSampledFrames) break;
            const highlight = highlights[i];
            const start = Number(highlight.start) || 0;
            const end = Number(highlight.end) || start;
            const duration = Math.max(0, end - start);
            if (duration <= 0.1) continue;

            const frameCount = Math.max(1, Math.min(maxFramesPerWindow, Math.ceil(duration / minFrameGapSeconds)));
            for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                if (sampledFrames.length >= maxTotalSampledFrames) break;
                const timestamp = start + ((frameIndex + 0.5) * duration) / frameCount;
                const framePath = path.join(framesDir, `h${i}-f${frameIndex}.jpg`);
                await this._executeQueueJob(
                    'extract-frame',
                    { input: videoPath, output: framePath, timestampSeconds: timestamp },
                    sessionId,
                );
                sampledFrames.push({ windowIndex: i, timestamp, path: framePath });
            }
        }


        if (sampledFrames.length > 0) {
            this.logger.debug(`[${sessionId}] 2.3.5 Refining highlights with ${sampledFrames.length} sampled frame(s)...`);
            try {
                const refined = await this._executeQueueJob(
                    'score-visual-highlights',
                    {
                        transcriptPath,
                        candidates: highlights,
                        sampledFrames,
                        outputPath: refinedHighlightsPath,
                    },
                    sessionId,
                );

                if (Array.isArray(refined) && refined.length > 0) {
                    highlights = refined;
                    this.logger.debug(`[${sessionId}] Refined to ${highlights.length} visually-scored highlight segments`);
                }
            } catch (err) {
                this.logger.warn(`[${sessionId}] Visual refinement failed, continuing with transcript highlights: ${err.message}`);
            }
        }

        // 2.4: Cut highlight segments
        this.logger.debug(`[${sessionId}] 2.4 Cutting ${highlights.length} highlight segments...`);
        const clipPaths: string[] = [];
        for (let i = 0; i < highlights.length; i++) {
            const h = highlights[i];
            const start = h.start;
            const end = h.end;
            const duration = Math.max(0.5, end - start);
            const clipPath = path.join(clipsDir, `clip-${i}.mp4`);
            await this._executeQueueJob('cut-segment', { input: videoPath, output: clipPath, start, duration }, sessionId);
            clipPaths.push(clipPath);
        }


        // 2.5: Merge clips
        this.logger.debug(`[${sessionId}] 2.5 Merging clips...`);
        await this._executeQueueJob('merge-videos', { inputs: clipPaths, output: mergedPath }, sessionId);


        // 2.5.5: Generate TTS from summary (what_happened) with fallback to highlights
        this.logger.debug(`[${sessionId}] 2.5.5 Generating TTS audio from summary...`);
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

        const requiredOpener = `5 minutes from now, you'll be smarter than 95% of people on today's world events — this is KnowIn5.`;

        let summaryWhatHappened = '';
        if (fs.existsSync(summaryPath)) {
            try {
                const summaryRaw = fs.readFileSync(summaryPath, 'utf-8');
                const summaryJson = JSON.parse(summaryRaw);
                summaryWhatHappened = typeof summaryJson?.what_happened === 'string' ? summaryJson.what_happened.trim() : '';
            } catch {

            }
        }

        const fallbackBody = (highlightText || transcriptJson?.text || '').trim();
        const seededSummary = summaryWhatHappened || (fallbackBody ? `${requiredOpener} ${fallbackBody}` : requiredOpener);
        const ttsText = seededSummary.startsWith(requiredOpener)
            ? seededSummary
            : `${requiredOpener} ${seededSummary}`.trim();

        fs.writeFileSync(transcriptTextPath, ttsText);
        await this._executeQueueJob(
            'generate-tts',
            { transcriptPath: transcriptTextPath, outputPath: ttsAudioPath, response_format: 'mp3' },
            sessionId
        );


        // 2.6: Replace merged video audio with TTS
        this.logger.debug(`[${sessionId}] 2.6 Replacing audio with TTS...`);
        await this._executeQueueJob('replace-audio', { inputVideo: mergedPath, inputAudio: ttsAudioPath, output: mergedWithTtsPath }, sessionId);


        // 2.7: Add watermark
        this.logger.debug(`[${sessionId}] 2.7 Adding watermark...`);
        await this._executeQueueJob('add-watermark', { input: mergedWithTtsPath, output: finalOutput, logoPath: logo }, sessionId);

        return { videoPath, audioPath, transcriptPath, summaryPath, highlightsPath, clipsDir, mergedPath, finalOutput, highlights };
    }

    /**
     * ===== HELPER: QUEUE JOB EXECUTION =====
     */

    private async _executeQueueJob(jobName: string, jobData: any, sessionId: number): Promise<any> {
        try {
            const job = await this.videoQueue.add(jobName, jobData);
            const result = await job.waitUntilFinished(this.queueEvents);
            this.logger.debug(`[${sessionId}] ✓ Job "${jobName}" completed`);
            return result;
        } catch (err) {
            throw new Error(`Job "${jobName}" failed: ${err.message}`);
        }
    }
}

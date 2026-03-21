import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // Commented out for testing
import * as path from 'path';
import { VideoIngestProvider, SourcedVideoMetadata } from './video-ingest.provider';
import { Queue, QueueEvents } from 'bullmq';
import * as fs from 'fs';
import { MediaScrapperService } from 'src/media-scrapper/providers/media-scrapper.service';
import { InjectQueue } from '@nestjs/bullmq';
import { RedisService } from 'src/common/redis/redis.service';
import {
    NarrationScene,
    TranscriptSegment,
} from '../interfaces/narration-scene.interface';

@Injectable()
export class MediaPipelineOrchestratorService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MediaPipelineOrchestratorService.name);
    private readonly baseDir = path.join(process.cwd(), 'videos');
    private readonly queueEvents: QueueEvents;

    constructor(
        @InjectQueue('video-processing')
        private readonly videoQueue: Queue,
        private readonly redisService: RedisService,
        private readonly mediaScrapperService: MediaScrapperService,
        private readonly videoIngestProvider: VideoIngestProvider,
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
            const metadata = await this.videoIngestProvider.downloadYouTubeVideo(sourceUrl, this.baseDir);
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
        const scenePlanPath = path.join(sessionDir, 'scene-plan.json');
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

        // 2.4: Generate TTS from summary (what_happened) with fallback to highlights
        this.logger.debug(`[${sessionId}] 2.4 Generating TTS audio from summary...`);
        const transcriptRaw = fs.readFileSync(transcriptPath, 'utf-8');
        const transcriptJson = JSON.parse(transcriptRaw);
        const transcriptSegments: TranscriptSegment[] = transcriptJson?.segments ?? [];
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

        const ttsDuration = await this._executeQueueJob('probe-media-duration', { input: ttsAudioPath }, sessionId);
        this.logger.debug(`[${sessionId}] Planned narration audio duration: ${Number(ttsDuration).toFixed(2)}s`);

        const narrationScenes = this._buildNarrationScenePlan({
            ttsText,
            totalDuration: Number(ttsDuration) || this._getTranscriptDuration(transcriptSegments),
            transcriptSegments,
        });
        fs.writeFileSync(scenePlanPath, JSON.stringify(narrationScenes, null, 2));
        this.logger.debug(`[${sessionId}] 2.5 Building ${narrationScenes.length} narration-driven scene(s)...`);

        // 2.5.5: Extract 3 candidate frames per scene (at 20 / 50 / 80 % of its mapped video window)
        //        then ask the vision model to pick the frame that best illustrates the narration.
        this.logger.debug(`[${sessionId}] 2.5.5 Selecting best frame per scene with vision model...`);
        const transcriptDuration = this._getTranscriptDuration(transcriptSegments);
        const ttsAudioDuration = Number(ttsDuration) || transcriptDuration || narrationScenes.length * 3;

        const sceneCandidates: Array<{ sceneIndex: number; frames: Array<{ path: string; timestamp: number }> }> = [];
        for (const scene of narrationScenes) {
            const videoStart = ttsAudioDuration > 0 ? (scene.startTime / ttsAudioDuration) * transcriptDuration : 0;
            const videoEnd = ttsAudioDuration > 0 ? (scene.endTime / ttsAudioDuration) * transcriptDuration : transcriptDuration;
            const range = Math.max(1, videoEnd - videoStart);
            const safeMax = Math.max(0.5, transcriptDuration - 0.5);
            // Extract 8 frames at evenly-spaced intervals across the scene's time window
            const timestamps = Array.from({ length: 8 }, (_, i) => {
                const ratio = (i + 1) / 9; // Divide into 9 equal parts, sample from 1/9 to 8/9
                return Math.min(safeMax, Math.max(0.5, videoStart + range * ratio));
            });
            const frames: Array<{ path: string; timestamp: number }> = [];
            for (let fi = 0; fi < timestamps.length; fi++) {
                const framePath = path.join(framesDir, `scene-${scene.index}-f${fi}.jpg`);
                await this._executeQueueJob(
                    'extract-frame',
                    { input: videoPath, output: framePath, timestampSeconds: timestamps[fi] },
                    sessionId,
                );
                frames.push({ path: framePath, timestamp: timestamps[fi] });
            }
            sceneCandidates.push({ sceneIndex: scene.index, frames });
        }

        let frameSelections: Array<{ sceneIndex: number; bestFramePath: string }> = [];
        try {
            frameSelections = await this._executeQueueJob(
                'select-scene-frames',
                {
                    scenes: narrationScenes.map(s => ({ index: s.index, text: s.text })),
                    sceneCandidates,
                },
                sessionId,
            );
        } catch (err) {
            this.logger.warn(`[${sessionId}] Vision frame selection failed, falling back to proportional timestamps: ${err.message}`);
        }

        const frameSelectionMap = new Map(frameSelections.map(s => [s.sceneIndex, s.bestFramePath]));

        // Build one clip per scene using the vision-selected frame (or fallback frame)
        const sceneClipPaths: string[] = [];
        for (const scene of narrationScenes) {
            let framePath = frameSelectionMap.get(scene.index);
            if (!framePath) {
                // Fallback: extract a single frame at the proportional midpoint
                framePath = path.join(framesDir, `scene-${scene.index}-fallback.jpg`);
                await this._executeQueueJob(
                    'extract-frame',
                    { input: videoPath, output: framePath, timestampSeconds: scene.targetTimestamp },
                    sessionId,
                );
            }
            const clipPath = path.join(clipsDir, `scene-${scene.index}.mp4`);
            await this._executeQueueJob(
                'create-image-video',
                { input: framePath, output: clipPath, duration: scene.duration },
                sessionId,
            );
            sceneClipPaths.push(clipPath);
        }

        // 2.6: Merge scene clips
        this.logger.debug(`[${sessionId}] 2.6 Merging ${sceneClipPaths.length} narration scene clip(s)...`);
        await this._executeQueueJob('merge-videos', { inputs: sceneClipPaths, output: mergedPath }, sessionId);

        // 2.7: Replace merged video audio with TTS
        this.logger.debug(`[${sessionId}] 2.7 Replacing audio with TTS...`);
        await this._executeQueueJob('replace-audio', { inputVideo: mergedPath, inputAudio: ttsAudioPath, output: mergedWithTtsPath }, sessionId);


        // 2.8: Add watermark
        this.logger.debug(`[${sessionId}] 2.8 Adding watermark...`);
        await this._executeQueueJob('add-watermark', { input: mergedWithTtsPath, output: finalOutput, logoPath: logo }, sessionId);

        return {
            videoPath,
            audioPath,
            transcriptPath,
            summaryPath,
            highlightsPath,
            scenePlanPath,
            clipsDir,
            mergedPath,
            finalOutput,
            highlights,
            narrationScenes,
        };
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

    private _buildNarrationScenePlan(params: {
        ttsText: string;
        totalDuration: number;
        transcriptSegments: TranscriptSegment[];
    }): NarrationScene[] {
        const { ttsText, totalDuration, transcriptSegments } = params;
        const sceneTexts = this._deriveNarrationSceneTexts(ttsText);
        const effectiveDuration = totalDuration > 0 ? totalDuration : Math.max(6, sceneTexts.length * 3);
        const sceneDurations = this._allocateSceneDurations(sceneTexts, effectiveDuration);
        const transcriptDuration = this._getTranscriptDuration(transcriptSegments) || effectiveDuration;
        const scenes: NarrationScene[] = [];

        let currentStartTime = 0;
        for (let index = 0; index < sceneTexts.length; index++) {
            const text = sceneTexts[index];
            const duration = sceneDurations[index] ?? 3;
            const startTime = currentStartTime;
            const endTime = index === sceneTexts.length - 1 ? effectiveDuration : startTime + duration;
            const targetTimestamp = transcriptDuration > 0
                ? Math.min(transcriptDuration, Math.max(0.5, ((startTime + endTime) / 2 / effectiveDuration) * transcriptDuration))
                : 0.5;
            scenes.push({
                index,
                text,
                startTime,
                endTime,
                duration: Math.max(1, endTime - startTime),
                targetTimestamp: Number(targetTimestamp.toFixed(2)),
            });

            currentStartTime = endTime;
        }

        return scenes;
    }

    private _deriveNarrationSceneTexts(ttsText: string): string[] {
        const normalized = (ttsText || '').replace(/\s+/g, ' ').trim();
        if (!normalized) {
            return ['Today\'s top story'];
        }

        const sentences = normalized
            .split(/(?<=[.!?])\s+/)
            .flatMap(sentence => sentence.split(/(?<=[,;:])\s+/))
            .map(sentence => sentence.trim())
            .filter(Boolean);

        const maxScenes = 8;
        const minWordsPerScene = 6;
        const chunks: string[] = [];
        let buffer: string[] = [];

        for (const sentence of sentences) {
            const words = sentence.split(/\s+/).filter(Boolean);
            if (words.length >= minWordsPerScene || !buffer.length) {
                if (buffer.length) {
                    chunks.push(buffer.join(' ').trim());
                    buffer = [];
                }
                chunks.push(sentence);
                continue;
            }

            buffer.push(sentence);
            if (buffer.join(' ').split(/\s+/).length >= minWordsPerScene) {
                chunks.push(buffer.join(' ').trim());
                buffer = [];
            }
        }

        if (buffer.length) {
            chunks.push(buffer.join(' ').trim());
        }

        const sceneTexts = chunks.length ? chunks : [normalized];
        while (sceneTexts.length > maxScenes) {
            const last = sceneTexts.pop();
            if (!last) break;
            sceneTexts[sceneTexts.length - 1] = `${sceneTexts[sceneTexts.length - 1]} ${last}`.trim();
        }

        return sceneTexts;
    }

    private _allocateSceneDurations(sceneTexts: string[], totalDuration: number): number[] {
        const safeTotalDuration = Math.max(1, totalDuration || sceneTexts.length * 3);
        const weights = sceneTexts.map(text => Math.max(1, text.split(/\s+/).filter(Boolean).length));
        const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || sceneTexts.length;

        let consumed = 0;
        return sceneTexts.map((_, index) => {
            if (index === sceneTexts.length - 1) {
                return Number(Math.max(1, safeTotalDuration - consumed).toFixed(3));
            }

            const duration = Number(((weights[index] / weightSum) * safeTotalDuration).toFixed(3));
            const remainingScenes = sceneTexts.length - index - 1;
            const maxAllowed = Math.max(1, safeTotalDuration - consumed - remainingScenes);
            const safeDuration = Number(Math.max(1, Math.min(maxAllowed, Math.max(1.25, duration))).toFixed(3));
            consumed += safeDuration;
            return safeDuration;
        });
    }

    private _getTranscriptDuration(transcriptSegments: TranscriptSegment[]): number {
        if (!transcriptSegments.length) {
            return 0;
        }
        return Number(transcriptSegments[transcriptSegments.length - 1]?.end || 0);
    }
}

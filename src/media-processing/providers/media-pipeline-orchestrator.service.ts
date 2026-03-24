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
import { SceneClipCandidate } from '../interfaces/scene-clip-candidate';
import { SceneClipSelection } from '../interfaces/scene-clip-selection';
import { LogoRegionDetection } from '../interfaces/logo-region-detection';

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
        const candidateClipsDir = path.join(sessionDir, 'candidate-clips');
        const cleanedClipsDir = path.join(sessionDir, 'cleaned-clips');
        const mergedPath = path.join(sessionDir, 'merged.mp4');
        const mergedWithTtsPath = path.join(sessionDir, 'merged-tts.mp4');
        const ttsAudioPath = path.join(sessionDir, 'tts-audio.mp3');
        const finalOutput = path.join(sessionDir, 'final-highlight.mp4');
        const logo = path.join(this.baseDir, 'logo.jpg');

        if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
        if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
        if (!fs.existsSync(candidateClipsDir)) fs.mkdirSync(candidateClipsDir, { recursive: true });
        if (!fs.existsSync(cleanedClipsDir)) fs.mkdirSync(cleanedClipsDir, { recursive: true });

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

        let summaryWhatHappened = '';
        if (fs.existsSync(summaryPath)) {
            try {
                const summaryRaw = fs.readFileSync(summaryPath, 'utf-8');
                const summaryJson = JSON.parse(summaryRaw);
                summaryWhatHappened = typeof summaryJson?.what_happened === 'string' ? summaryJson.what_happened.trim() : '';
            } catch { /* ignore parse errors */ }
        }

        const fallbackBody = (highlightText || transcriptJson?.text || '').trim();
        const ttsText = (summaryWhatHappened || fallbackBody).trim();

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

        // 2.5.5: Build candidate silent clips per narration scene, then ask the vision model
        //        to choose the clip that best supports the narration using preview frames.
        this.logger.debug(`[${sessionId}] 2.5.5 Selecting best silent clip per scene with vision model...`);
        const transcriptDuration = this._getTranscriptDuration(transcriptSegments);
        const ttsAudioDuration = Number(ttsDuration) || transcriptDuration || narrationScenes.length * 3;

        const sceneCandidates: SceneClipCandidate[] = [];
        for (const scene of narrationScenes) {
            const clipCandidates = this._buildSceneClipCandidates({
                scene,
                transcriptDuration,
                ttsAudioDuration,
            });

            const clips: SceneClipCandidate['clips'] = [];
            for (let ci = 0; ci < clipCandidates.length; ci++) {
                const candidate = clipCandidates[ci];
                const clipPath = path.join(candidateClipsDir, `scene-${scene.index}-candidate-${ci}.mp4`);
                await this._executeQueueJob(
                    'cut-segment',
                    {
                        input: videoPath,
                        output: clipPath,
                        start: candidate.start,
                        duration: candidate.duration,
                        mute: true,
                    },
                    sessionId,
                );

                const previewFrames: Array<{ path: string; timestamp: number }> = [];
                for (let pi = 0; pi < candidate.previewTimestamps.length; pi++) {
                    const previewTimestamp = candidate.previewTimestamps[pi];
                    const framePath = path.join(framesDir, `scene-${scene.index}-candidate-${ci}-preview-${pi}.jpg`);
                    await this._executeQueueJob(
                        'extract-frame',
                        { input: videoPath, output: framePath, timestampSeconds: previewTimestamp },
                        sessionId,
                    );
                    previewFrames.push({ path: framePath, timestamp: previewTimestamp });
                }

                clips.push({
                    path: clipPath,
                    start: candidate.start,
                    duration: candidate.duration,
                    previewFrames,
                });
            }

            sceneCandidates.push({ sceneIndex: scene.index, clips });
        }

        let clipSelections: SceneClipSelection[] = [];
        try {
            clipSelections = await this._executeQueueJob(
                'select-scene-clips',
                {
                    scenes: narrationScenes.map(s => ({ index: s.index, text: s.text })),
                    sceneCandidates,
                },
                sessionId,
            );
        } catch (err) {
            this.logger.warn(`[${sessionId}] Vision clip selection failed, falling back to middle candidate clips: ${err.message}`);
        }

        const sceneCandidateMap = new Map(sceneCandidates.map(candidate => [candidate.sceneIndex, candidate.clips]));
        const clipSelectionMap = new Map(clipSelections.map(selection => [selection.sceneIndex, selection.bestClipPath]));

        const sourceVideoDuration = await this._executeQueueJob('probe-media-duration', { input: videoPath }, sessionId);
        const detectedLogoRegion = await this._detectLogoRegion({
            videoPath,
            videoDuration: Number(sourceVideoDuration),
            framesDir,
            sessionId,
        });
        if (detectedLogoRegion) {
            this.logger.debug(
                `[${sessionId}] Persistent logo detected at normalized box x=${detectedLogoRegion.x}, y=${detectedLogoRegion.y}, w=${detectedLogoRegion.width}, h=${detectedLogoRegion.height}`
            );
        }

        // Build the final visual sequence using the vision-selected silent clips (or fallback candidate clip)
        const sceneClipPaths: string[] = [];
        for (const scene of narrationScenes) {
            const candidateClips = sceneCandidateMap.get(scene.index) ?? [];
            const selectedClipPath = clipSelectionMap.get(scene.index);
            const fallbackClip = candidateClips[Math.floor(candidateClips.length / 2)] ?? candidateClips[0];
            const chosenClip = candidateClips.find(candidate => candidate.path === selectedClipPath) ?? fallbackClip;

            if (!chosenClip) {
                throw new Error(`No candidate clip available for narration scene ${scene.index}`);
            }

            const finalSceneClipPath = path.join(clipsDir, `scene-${scene.index}.mp4`);
            if (detectedLogoRegion) {
                const cleanedClipPath = path.join(cleanedClipsDir, `scene-${scene.index}-clean.mp4`);
                await this._executeQueueJob(
                    'sanitize-logo-region',
                    {
                        input: chosenClip.path,
                        output: cleanedClipPath,
                        logoRegion: detectedLogoRegion,
                        strategy: 'blur',
                        replacementLogoPath: undefined,
                    },
                    sessionId,
                );
                fs.copyFileSync(cleanedClipPath, finalSceneClipPath);
            } else {
                fs.copyFileSync(chosenClip.path, finalSceneClipPath);
            }
            scene.selectedClipPath = finalSceneClipPath;
            sceneClipPaths.push(finalSceneClipPath);
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

    private _buildSceneClipCandidates(params: {
        scene: NarrationScene;
        transcriptDuration: number;
        ttsAudioDuration: number;
    }): Array<{ start: number; duration: number; previewTimestamps: number[] }> {
        const { scene, transcriptDuration, ttsAudioDuration } = params;
        const safeTranscriptDuration = transcriptDuration > 0 ? transcriptDuration : Math.max(scene.targetTimestamp + scene.duration, scene.duration);
        const mappedStart = ttsAudioDuration > 0 ? (scene.startTime / ttsAudioDuration) * safeTranscriptDuration : 0;
        const mappedEnd = ttsAudioDuration > 0 ? (scene.endTime / ttsAudioDuration) * safeTranscriptDuration : safeTranscriptDuration;

        const candidateDuration = Number(Math.max(1, Math.min(scene.duration, Math.max(1.5, mappedEnd - mappedStart || scene.duration))).toFixed(3));
        const searchStart = Math.max(0, mappedStart - candidateDuration * 0.6);
        const maxStart = Math.max(0, safeTranscriptDuration - candidateDuration);
        const searchEnd = Math.min(maxStart, mappedEnd);
        const candidateCount = 3;

        const starts = searchEnd <= searchStart
            ? [Math.min(maxStart, Math.max(0, scene.targetTimestamp - candidateDuration / 2))]
            : Array.from({ length: candidateCount }, (_, index) => {
                const ratio = index / (candidateCount - 1);
                return searchStart + (searchEnd - searchStart) * ratio;
            });

        return starts.map((start) => {
            const safeStart = Number(Math.max(0, Math.min(maxStart, start)).toFixed(3));
            const previewRatios = [0.2, 0.5, 0.8];
            const previewTimestamps = previewRatios.map((ratio) => {
                const timestamp = safeStart + candidateDuration * ratio;
                return Number(Math.max(0.1, Math.min(safeTranscriptDuration, timestamp)).toFixed(3));
            });

            return {
                start: safeStart,
                duration: candidateDuration,
                previewTimestamps,
            };
        });
    }

    private async _detectLogoRegion(params: {
        videoPath: string;
        videoDuration: number;
        framesDir: string;
        sessionId: number;
    }): Promise<LogoRegionDetection | null> {
        const { videoPath, videoDuration, framesDir, sessionId } = params;
        const safeDuration = Number(videoDuration) > 0 ? Number(videoDuration) : 0;
        if (safeDuration <= 0) {
            return null;
        }

        const sampleRatios = [0.1, 0.3, 0.5, 0.7, 0.9];
        const sampleFramePaths: string[] = [];

        for (let index = 0; index < sampleRatios.length; index++) {
            const timestampSeconds = Number(Math.max(0.2, Math.min(safeDuration - 0.2, safeDuration * sampleRatios[index])).toFixed(3));
            const framePath = path.join(framesDir, `logo-sample-${index}.jpg`);
            await this._executeQueueJob(
                'extract-frame',
                { input: videoPath, output: framePath, timestampSeconds },
                sessionId,
            );
            sampleFramePaths.push(framePath);
        }

        try {
            return await this._executeQueueJob(
                'detect-logo-region',
                { framePaths: sampleFramePaths },
                sessionId,
            );
        } catch (err) {
            this.logger.warn(`[${sessionId}] Logo detection failed; continuing without delogo cleanup: ${err.message}`);
            return null;
        }
    }

    private _getTranscriptDuration(transcriptSegments: TranscriptSegment[]): number {
        if (!transcriptSegments.length) {
            return 0;
        }
        return Number(transcriptSegments[transcriptSegments.length - 1]?.end || 0);
    }
}

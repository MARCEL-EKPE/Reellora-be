import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FfmpegProvider } from "./ffmpeg.provider";
import { TranscriptionProvider } from "./transcription.provider";
import { TranscriptHighlightExtractorProvider } from "./transcript-highlight-extractor.provider";
import { NewsSummaryProvider } from "./news-summary.provider";
import { VisionFrameSelectorProvider } from "./vision-frame-selector.provider";
import { TextToSpeechProvider } from "./text-to-speech.provider";
import * as fs from 'fs';
import { LogoRegionDetection } from "../interfaces/logo-region-detection";

function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

@Processor('video-processing')
export class MediaJobsWorker extends WorkerHost {

    constructor(
        private readonly ffmpegProvider: FfmpegProvider,
        private readonly transcriptionProvider: TranscriptionProvider,
        private readonly transcriptHighlightExtractorProvider: TranscriptHighlightExtractorProvider,
        private readonly newsSummaryProvider: NewsSummaryProvider,
        private readonly visionFrameSelectorProvider: VisionFrameSelectorProvider,
        private readonly textToSpeechProvider: TextToSpeechProvider
    ) { super() }


    async process(job: Job) {
        console.log("WORKER: Job received →", job.name);

        switch (job.name) {
            case 'add-watermark':
                return this.ffmpegProvider.addWatermark(job.data.input, job.data.output, job.data.logoPath);

            case 'extract-audio':
                return this.ffmpegProvider.extractAudio(job.data.input, job.data.output, job.data.format);

            case 'compress-audio':
                return this.ffmpegProvider.compressAudio(job.data.input, job.data.output, job.data.bitrate);

            case 'transcribe-audio': {
                const result = await this.transcriptionProvider.transcribe(job.data.input, job.data.model);
                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(result));
                    } catch (err) {
                        console.warn('Unable to write transcription output file', getErrorMessage(err));
                    }
                }
                return result;
            }

            case 'analyze-highlights': {
                let transcript = job.data.transcript;
                if (job.data.transcriptPath) {
                    try {
                        const raw = fs.readFileSync(job.data.transcriptPath, 'utf-8');
                        transcript = JSON.parse(raw);
                    } catch (err) {
                        console.warn('Unable to read transcriptPath, falling back to provided transcript');
                    }
                }
                const highlights = await this.transcriptHighlightExtractorProvider.selectHighlights(transcript, job.data.maxHighlights);
                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(highlights));
                    } catch (err) {
                        console.warn('Unable to write highlights output file', getErrorMessage(err));
                    }
                }
                return highlights;
            }

            case 'summarize-news': {
                let transcript = job.data.transcript;
                if (job.data.transcriptPath) {
                    try {
                        const raw = fs.readFileSync(job.data.transcriptPath, 'utf-8');
                        transcript = JSON.parse(raw);
                    } catch (err) {
                        console.warn('Unable to read transcriptPath for summary, falling back to provided transcript');
                    }
                }

                const summary = await this.newsSummaryProvider.summarizeNewsTranscript(transcript);
                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(summary));
                    } catch (err) {
                        console.warn('Unable to write summary output file', getErrorMessage(err));
                    }
                }
                return summary;
            }

            case 'generate-tts':
                return this.textToSpeechProvider.generateSpeech(job.data);

            case 'cut-segment':
                return this.ffmpegProvider.cutVideo(job.data.input, job.data.output, job.data.start, job.data.duration, {
                    mute: Boolean(job.data.mute),
                });

            case 'merge-videos':
                return this.ffmpegProvider.mergeVideos(job.data.inputs, job.data.output);

            case 'replace-audio':
                return this.ffmpegProvider.replaceAudio(job.data.inputVideo, job.data.inputAudio, job.data.output);

            case 'extract-frame':
                return this.ffmpegProvider.extractFrame(job.data.input, job.data.output, job.data.timestampSeconds);

            case 'probe-media-duration':
                return this.ffmpegProvider.getMediaDuration(job.data.input);

            case 'detect-logo-region':
                return this.visionFrameSelectorProvider.detectPersistentLogoRegion(job.data.framePaths || []);

            case 'sanitize-logo-region':
                return this.ffmpegProvider.sanitizeLogoRegion(
                    job.data.input,
                    job.data.output,
                    {
                        ...(job.data.logoRegion as LogoRegionDetection),
                        normalized: true,
                    },
                    {
                        strategy: job.data.strategy,
                        replacementLogoPath: job.data.replacementLogoPath,
                    }
                );

            case 'select-scene-clips': {
                return this.visionFrameSelectorProvider.selectBestClipsForScenes({
                    scenes: job.data.scenes || [],
                    sceneCandidates: job.data.sceneCandidates || [],
                });
            }

            default:
                throw new Error(`Unknown job type: ${job.name}`);
        }
    }

    @OnWorkerEvent("completed")
    onCompleted(job: Job) {
        console.log(`✅ Job completed: ${job.id}`);
    }

    @OnWorkerEvent("failed")
    onFailed(job: Job, err: Error) {
        console.error(`❌ Job failed: ${job.id}`, err.message);
    }
}


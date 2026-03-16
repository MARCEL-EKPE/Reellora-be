import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FfmpegProvider } from "./ffmpeg.provider";
import { TranscriptionProvider } from "./transcription.provider";
import { AiProvider } from "./ai.provider";
import { TextToSpeechProvider } from "./text-to-speech.provider";
import * as fs from 'fs';

@Processor('video-processing')
export class MediaProcessorWorker extends WorkerHost {

    constructor(
        private readonly ffmpegProvider: FfmpegProvider,
        private readonly transcriptionProvider: TranscriptionProvider,
        private readonly aiProvider: AiProvider,
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
                        console.warn('Unable to write transcription output file', err.message);
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
                const highlights = await this.aiProvider.selectHighlights(transcript, job.data.maxHighlights);
                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(highlights));
                    } catch (err) {
                        console.warn('Unable to write highlights output file', err.message);
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

                const summary = await this.aiProvider.summarizeNewsTranscript(transcript);
                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(summary));
                    } catch (err) {
                        console.warn('Unable to write summary output file', err.message);
                    }
                }
                return summary;
            }

            case 'generate-tts':
                return this.textToSpeechProvider.generateSpeech(job.data);

            case 'cut-segment':
                return this.ffmpegProvider.cutVideo(job.data.input, job.data.output, job.data.start, job.data.duration);

            case 'merge-videos':
                return this.ffmpegProvider.mergeVideos(job.data.inputs, job.data.output);

            case 'replace-audio':
                return this.ffmpegProvider.replaceAudio(job.data.inputVideo, job.data.inputAudio, job.data.output);

            case 'extract-frame':
                return this.ffmpegProvider.extractFrame(job.data.input, job.data.output, job.data.timestampSeconds);

            case 'score-visual-highlights': {
                let transcript = job.data.transcript;
                if (job.data.transcriptPath) {
                    try {
                        const raw = fs.readFileSync(job.data.transcriptPath, 'utf-8');
                        transcript = JSON.parse(raw);
                    } catch (err) {
                        console.warn('Unable to read transcriptPath for visual scoring, falling back to provided transcript');
                    }
                }

                const refined = await this.aiProvider.refineHighlightsWithVision({
                    transcript,
                    candidates: job.data.candidates || [],
                    sampledFrames: job.data.sampledFrames || [],
                });

                if (job.data.outputPath) {
                    try {
                        fs.writeFileSync(job.data.outputPath, JSON.stringify(refined));
                    } catch (err) {
                        console.warn('Unable to write visual scoring output file', err.message);
                    }
                }

                return refined;
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


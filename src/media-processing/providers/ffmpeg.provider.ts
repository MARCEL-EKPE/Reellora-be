import { Injectable } from '@nestjs/common';
import ffmpeg from "node-fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import ffprobeInstaller from "@ffprobe-installer/ffprobe"
import * as os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

@Injectable()
export class FfmpegProvider {

    async getMediaDimensions(inputPath: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) return reject(err);
                const videoStream = metadata?.streams?.find((stream) => stream.codec_type === 'video');
                const width = Number(videoStream?.width ?? 0);
                const height = Number(videoStream?.height ?? 0);
                resolve({ width, height });
            });
        });
    }

    async getMediaDuration(inputPath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) return reject(err);
                const duration = Number(metadata?.format?.duration ?? 0);
                resolve(duration);
            });
        });
    }

    async trimVideo(inputPath: string, outputPath: string, duration?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime("00:00:08")
                .setDuration(duration)
                .output(outputPath)
                .on("end", () => resolve(outputPath))
                .on("error", reject)
                .run();
        });
    }


    async addWatermark(
        inputPath: string,
        outputPath: string,
        logoPath: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .input(logoPath)
                .complexFilter([
                    {
                        filter: 'scale2ref',
                        options: {
                            w: 'main_w*0.08', // 8% of video width
                            h: 'ow/mdar',
                        },
                        inputs: ['1:v', '0:v'],
                        outputs: ['wm', 'base'],
                    },
                    {
                        filter: 'overlay',
                        options: {
                            x: 'main_w-overlay_w-20',
                            y: 'main_h-overlay_h-20',
                        },
                        inputs: ['base', 'wm'],
                        outputs: ['v'],
                    },
                ])
                .outputOptions([
                    '-map [v]',
                    '-map 0:a?',
                    '-c:a aac',
                    '-shortest',
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    async extractAudio(inputVideoPath: string, outputAudioPath: string, format = 'wav'): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputVideoPath)
                .noVideo()
                .format(format)
                .output(outputAudioPath)
                .on('end', () => resolve(outputAudioPath))
                .on('error', reject)
                .run();
        });
    }

    async compressAudio(inputAudioPath: string, outputAudioPath: string, bitrate = '64k'): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputAudioPath)
                .audioBitrate(bitrate)
                .audioFrequency(16000) // Whisper works well at 16kHz
                .output(outputAudioPath)
                .on('end', () => resolve(outputAudioPath))
                .on('error', reject)
                .run();
        });
    }

    async cutVideo(
        inputPath: string,
        outputPath: string,
        start: string | number,
        duration: number,
        options?: { mute?: boolean }
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const cmd = ffmpeg(inputPath);
            if (typeof start === 'number') {
                const hrs = Math.floor(start / 3600).toString().padStart(2, '0');
                const mins = Math.floor((start % 3600) / 60).toString().padStart(2, '0');
                const secs = Math.floor(start % 60).toString().padStart(2, '0');
                cmd.setStartTime(`${hrs}:${mins}:${secs}`);
            } else {
                cmd.setStartTime(start as string);
            }
            if (options?.mute) {
                cmd.noAudio();
            }
            cmd.setDuration(duration)
                .outputOptions(['-movflags +faststart'])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    async mergeVideos(inputs: string[], outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!inputs || inputs.length === 0) return reject(new Error('No input files provided'));
            const merger = ffmpeg();
            inputs.forEach((p) => merger.input(p));
            merger
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .mergeToFile(outputPath, os.tmpdir());
        });
    }

    async replaceAudio(inputVideoPath: string, inputAudioPath: string, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputVideoPath)
                .input(inputAudioPath)
                .outputOptions([
                    '-map 0:v:0',
                    '-map 1:a:0',
                    '-c:v copy',
                    '-c:a aac',
                    '-shortest',
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    async extractFrame(inputVideoPath: string, outputImagePath: string, timestampSeconds: number): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputVideoPath)
                .setStartTime(timestampSeconds)
                .frames(1)
                .outputOptions(['-vf scale=1920:-2', '-q:v 8'])
                .output(outputImagePath)
                .on('end', () => resolve(outputImagePath))
                .on('error', reject)
                .run();
        });
    }

    async sanitizeLogoRegion(
        inputVideoPath: string,
        outputVideoPath: string,
        logoRegion: { x: number; y: number; width: number; height: number; normalized?: boolean },
        options?: { strategy?: 'blur' | 'overlay-watermark'; replacementLogoPath?: string }
    ): Promise<string> {
        const { width: videoWidth, height: videoHeight } = await this.getMediaDimensions(inputVideoPath);
        const useNormalized = logoRegion.normalized !== false;

        const x = useNormalized ? Math.round(logoRegion.x * videoWidth) : Math.round(logoRegion.x);
        const y = useNormalized ? Math.round(logoRegion.y * videoHeight) : Math.round(logoRegion.y);
        const width = useNormalized ? Math.round(logoRegion.width * videoWidth) : Math.round(logoRegion.width);
        const height = useNormalized ? Math.round(logoRegion.height * videoHeight) : Math.round(logoRegion.height);

        const padding = 6;
        const safeX = Math.max(0, Math.min(videoWidth - 1, x - padding));
        const safeY = Math.max(0, Math.min(videoHeight - 1, y - padding));
        const safeWidth = Math.max(12, Math.min(videoWidth - safeX, width + padding * 2));
        const safeHeight = Math.max(12, Math.min(videoHeight - safeY, height + padding * 2));
        const strategy = options?.strategy ?? 'blur';

        if (strategy === 'overlay-watermark' && options?.replacementLogoPath) {
            return new Promise((resolve, reject) => {
                ffmpeg(inputVideoPath)
                    .input(options.replacementLogoPath)
                    .complexFilter([
                        {
                            filter: 'scale',
                            options: {
                                w: safeWidth,
                                h: safeHeight,
                            },
                            inputs: '1:v',
                            outputs: 'wm',
                        },
                        {
                            filter: 'overlay',
                            options: {
                                x: safeX,
                                y: safeY,
                            },
                            inputs: ['0:v', 'wm'],
                            outputs: 'v',
                        },
                    ])
                    .outputOptions(['-map [v]', '-an', '-movflags +faststart'])
                    .output(outputVideoPath)
                    .on('end', () => resolve(outputVideoPath))
                    .on('error', reject)
                    .run();
            });
        }

        return new Promise((resolve, reject) => {
            ffmpeg(inputVideoPath)
                .videoFilters([
                    `delogo=x=${safeX}:y=${safeY}:w=${safeWidth}:h=${safeHeight}:show=0`,
                ])
                .noAudio()
                .outputOptions(['-movflags +faststart'])
                .output(outputVideoPath)
                .on('end', () => resolve(outputVideoPath))
                .on('error', reject)
                .run();
        });
    }

}


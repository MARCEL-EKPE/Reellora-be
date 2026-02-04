import { Injectable } from '@nestjs/common';
import ffmpeg from "node-fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import ffprobeInstaller from "@ffprobe-installer/ffprobe"
import * as os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

@Injectable()
export class FfmpegProvider {

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
                    },
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

    async cutVideo(inputPath: string, outputPath: string, start: string | number, duration: number): Promise<string> {
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
            cmd.setDuration(duration)
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

}

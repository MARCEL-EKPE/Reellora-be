import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as path from 'path';
import { FfmpegProvider } from './ffmpeg.provider';

@Injectable()
export class MediaProcessingService {

    constructor(
        private readonly ffmpegProvider: FfmpegProvider
    ) { }

    //@Cron('0 59 23 * * *') the actual time for production
    //@Cron('10 * * * * *')

    async EditVideoQueue() {
        const baseDir = path.join(process.cwd(), 'videos');

        const input = path.join(baseDir, 'input.mp4');
        const trimmed = path.join(baseDir, `trimmed-${Date.now()}.mp4`);
        const finalOutput = path.join(baseDir, `final-${Date.now()}.mp4`);
        const logo = path.join(baseDir, 'logo.jpg');

        console.log('Starting video edit pipeline...');

        // 1️⃣ Trim video
        await this.ffmpegProvider.trimVideo(
            input,
            trimmed,
            30
        );

        // 2️⃣ Add watermark
        await this.ffmpegProvider.addWatermark(
            trimmed,
            finalOutput,
            logo
        );

        console.log('Video processing completed:', finalOutput);

        return finalOutput;
    }
}

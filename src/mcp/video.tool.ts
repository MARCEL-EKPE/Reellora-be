import { Tool } from '@nestjs-mcp/server';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { z } from 'zod';

export class VideoTools {
    constructor(
        @InjectQueue('video-processing')
        private readonly videoQueue: Queue,
    ) { }

    @Tool({
        name: 'trimVideo',
        description: 'Trim a video using FFmpeg',
        paramsSchema: {
            input: z.string(),
            output: z.string(),
            duration: z.number(),
        },
    })
    async trimVideo({
        input,
        output,
        duration,
    }: {
        input: string;
        output: string;
        duration: number;
    }) {
        const job = await this.videoQueue.add('trim-video', {
            input,
            output,
            duration,
        });

        return { jobId: String(job.id) };
    }

    @Tool({
        name: 'addWatermark',
        description: 'Add watermark to a video',
        paramsSchema: {
            input: z.string(),
            output: z.string(),
            logoPath: z.string(),
        },
    })
    async addWatermark({
        input,
        output,
        logoPath,
    }: {
        input: string;
        output: string;
        logoPath: string;
    }) {
        const job = await this.videoQueue.add('add-watermark', {
            input,
            output,
            logoPath,
        });

        return { jobId: String(job.id) };
    }
}

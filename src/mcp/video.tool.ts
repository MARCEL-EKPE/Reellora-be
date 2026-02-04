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
        name: 'extractAudio',
        description: 'Extract audio from a video file',
        paramsSchema: {
            input: z.string(),
            output: z.string(),
            format: z.string().optional(),
        },
    })
    async extractAudio({
        input,
        output,
        format,
    }: {
        input: string;
        output: string;
        format?: string;
    }) {
        const job = await this.videoQueue.add('extract-audio', {
            input,
            output,
            format,
        });

        return { jobId: String(job.id) };
    }

    @Tool({
        name: 'cutSegment',
        description: 'Cut a segment from a video',
        paramsSchema: {
            input: z.string(),
            output: z.string(),
            start: z.union([z.number(), z.string()]),
            duration: z.number(),
        },
    })
    async cutSegment({
        input,
        output,
        start,
        duration,
    }: {
        input: string;
        output: string;
        start: string | number;
        duration: number;
    }) {
        const job = await this.videoQueue.add('cut-segment', {
            input,
            output,
            start,
            duration,
        });

        return { jobId: String(job.id) };
    }

    @Tool({
        name: 'mergeVideos',
        description: 'Merge multiple video files into one',
        paramsSchema: {
            inputs: z.array(z.string()),
            output: z.string(),
        },
    })
    async mergeVideos({
        inputs,
        output,
    }: {
        inputs: string[];
        output: string;
    }) {
        const job = await this.videoQueue.add('merge-videos', {
            inputs,
            output,
        });

        return { jobId: String(job.id) };
    }
}

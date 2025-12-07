import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FfmpegProvider } from "./ffmpeg.provider";
import * as path from "path"

@Processor('video-processing')
export class MediaProcessorWorker extends WorkerHost {

    constructor(
        private readonly ffmpegProvider: FfmpegProvider
    ) { super(); }


    async process(job: Job): Promise<any> {

        console.log("WORKER: Starting video edit...");

        const input = path.join(process.cwd(), "videos", "input.mp4");
        const output = path.join(process.cwd(), "videos", `output-${Date.now()}.mp4`);

        const result = await this.ffmpegProvider.trimVideo(input, output);

        console.log("WORKER: Finished:", result);

        return { output: result };
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`Job completed: ${job.id}`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        console.log(`Job failed: ${job.id}`, err.message);
    }
}


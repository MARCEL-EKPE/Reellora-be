import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { FfmpegProvider } from "./ffmpeg.provider";

@Processor('video-processing')
export class MediaProcessorWorker extends WorkerHost {

    constructor(
        private readonly ffmpegProvider: FfmpegProvider
    ) { super(); }


    async process(job: Job) {
        console.log("WORKER: Job received →", job.name);

        switch (job.name) {
            case "trim-video":
                return this.ffmpegProvider.trimVideo(
                    job.data.input,
                    job.data.output,
                    job.data.duration
                );

            case 'add-watermark':
                return this.ffmpegProvider.addWatermark(job.data.input, job.data.output, job.data.logoPath);

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


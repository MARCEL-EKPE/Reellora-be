import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class MediaProcessingService {

    constructor(
        @InjectQueue('video-processing')
        private readonly videoQueue: Queue
    ) { }

    // @Cron('0 59 23 * * *') the actual time for production
    @Cron('10 * * * * *')
    async testQueue() {
        console.log('Adding job to queue...');
        return this.videoQueue.add('test-job', {
            message: 'Hello from service',
        });
    }
}

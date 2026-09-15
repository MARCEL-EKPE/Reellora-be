import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  RESEARCH_QUEUE,
  SCRIPT_QUEUE,
  VIDEO_PLANNING_QUEUE,
  VIDEO_GENERATION_QUEUE,
  RENDER_QUEUE,
  QUALITY_CONTROL_QUEUE,
  PUBLISHING_QUEUE,
} from '../constants/queue-names.constant';
import type {
  PipelineJob,
  PipelineStage,
  SceneGenerationJob,
} from '../../shared/interfaces/pipeline-job.interface';

@Injectable()
export class PipelineOrchestratorService {
  private readonly logger = new Logger(PipelineOrchestratorService.name);

  constructor(
    @InjectQueue(RESEARCH_QUEUE)
    private readonly researchQueue: Queue<PipelineJob>,
    @InjectQueue(SCRIPT_QUEUE) private readonly scriptQueue: Queue<PipelineJob>,
    @InjectQueue(VIDEO_PLANNING_QUEUE)
    private readonly videoPlanningQueue: Queue<PipelineJob>,
    @InjectQueue(VIDEO_GENERATION_QUEUE)
    private readonly videoGenerationQueue: Queue<SceneGenerationJob>,
    @InjectQueue(RENDER_QUEUE) private readonly renderQueue: Queue<PipelineJob>,
    @InjectQueue(QUALITY_CONTROL_QUEUE)
    private readonly qualityControlQueue: Queue<PipelineJob>,
    @InjectQueue(PUBLISHING_QUEUE)
    private readonly publishingQueue: Queue<PipelineJob>,
  ) {}

  async startPipeline(videoId: string): Promise<void> {
    this.logger.log(`Starting video generation pipeline for video ${videoId}`);
    await this.enqueue(videoId, 'research');
  }

  async enqueueFromRequest(videoId: string): Promise<void> {
    this.logger.log(`Enqueuing generation request for video ${videoId}`);
    await this.enqueue(videoId, 'research');
  }

  async enqueue(
    videoId: string,
    stage: PipelineStage,
    delayMs = 0,
  ): Promise<void> {
    const queue = this.getQueueForStage(stage);
    await queue.add(stage, { videoId, stage } as PipelineJob, {
      delay: delayMs,
    });
  }

  async enqueueSceneGenerations(
    videoId: string,
    sceneIds: string[],
  ): Promise<void> {
    this.logger.log(
      `Enqueuing ${sceneIds.length} scene generation jobs for video ${videoId}`,
    );
    await Promise.all(
      sceneIds.map((sceneId) =>
        this.videoGenerationQueue.add('generate-scene', { videoId, sceneId }),
      ),
    );
  }

  private getQueueForStage(stage: PipelineStage): Queue<PipelineJob> {
    switch (stage) {
      case 'research':
        return this.researchQueue;
      case 'script':
        return this.scriptQueue;
      case 'plan':
        return this.videoPlanningQueue;
      case 'render':
        return this.renderQueue;
      case 'quality-check':
        return this.qualityControlQueue;
      case 'publish':
        return this.publishingQueue;
      default:
        throw new Error(`Unknown pipeline stage: ${stage}`);
    }
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { VIDEO_PLANNING_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { VideoPlan as VideoPlanEntity } from '../../pipeline-core/entities/video-plan.entity';
import { VideoScene as VideoSceneEntity } from '../../pipeline-core/entities/video-scene.entity';
import { SceneStatus } from '../../pipeline-core/enums/scene-status.enum';
import { VideoPlannerProvider } from '../../video-planning/providers/video-planner.provider';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../interfaces/pipeline-job.interface';
import type { VideoScript } from '../../script/interfaces/script.interface';

@Processor(VIDEO_PLANNING_QUEUE)
export class VideoPlanningProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoPlanningProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoPlanEntity)
    private readonly videoPlanRepository: Repository<VideoPlanEntity>,
    @InjectRepository(VideoSceneEntity)
    private readonly videoSceneRepository: Repository<VideoSceneEntity>,
    private readonly videoPlannerProvider: VideoPlannerProvider,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[VideoPlanning] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['script'],
    });
    if (!video || !video.script) {
      throw new Error(`Video ${videoId} has no linked script`);
    }

    try {
      const script: VideoScript = {
        title: video.script.title,
        hook: video.script.hook,
        sections: video.script.sections,
        conclusion: video.script.conclusion,
        fullText: video.script.fullText,
        keywords: video.script.keywords,
        tags: video.script.tags,
        thumbnailConcept: video.script.thumbnailConcept,
        estimatedDurationSeconds: video.script.estimatedDurationSeconds,
      };

      const plan = await this.videoPlannerProvider.createPlan(script);

      const videoPlan = this.videoPlanRepository.create({
        video,
        title: plan.title,
        estimatedDurationSeconds: plan.estimatedDurationSeconds,
      });
      await this.videoPlanRepository.save(videoPlan);

      const sceneEntities = (plan.scenes || []).map((scene) =>
        this.videoSceneRepository.create({
          videoPlan,
          order: scene.order,
          narration: scene.narration || '',
          durationSeconds: scene.durationSeconds ?? 5,
          visual: scene.visual
            ? (scene.visual as unknown as Record<string, unknown>)
            : undefined,
          transition: scene.transition
            ? (scene.transition as unknown as Record<string, unknown>)
            : undefined,
          status: SceneStatus.PENDING,
        }),
      );
      await this.videoSceneRepository.save(sceneEntities);

      video.status = VideoStatus.GENERATING_MEDIA;
      await this.videoRepository.save(video);

      await this.orchestrator.enqueueSceneGenerations(
        videoId,
        sceneEntities.map((s) => s.id),
      );
    } catch (error) {
      this.logger.error(`[VideoPlanning] failed for videoId=${videoId}`, error);
      video.status = VideoStatus.PLANNING_FAILED;
      video.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoRepository.save(video);
      throw error;
    }
  }
}

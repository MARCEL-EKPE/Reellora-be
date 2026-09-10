import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Article } from './entities/article.entity';
import { Research } from './entities/research.entity';
import { Script } from './entities/script.entity';
import { VideoPlan } from './entities/video-plan.entity';
import { VideoScene } from './entities/video-scene.entity';
import { GenerationJob } from './entities/generation-job.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { RenderJob } from './entities/render-job.entity';
import { QualityCheck } from './entities/quality-check.entity';
import { Publication } from './entities/publication.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Video,
            Article,
            Research,
            Script,
            VideoPlan,
            VideoScene,
            GenerationJob,
            MediaAsset,
            RenderJob,
            QualityCheck,
            Publication,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class PipelineCoreModule { }

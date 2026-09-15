import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { VideosController } from './videos.controller';
import { DashboardService } from './dashboard.service';
import { NewsItem } from '../pipeline-core/entities/news-item.entity';
import { Video } from '../pipeline-core/entities/video.entity';
import { PipelineQueuesModule } from '../pipeline-queues/pipeline-queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsItem, Video]),
    PipelineQueuesModule,
  ],
  controllers: [DashboardController, VideosController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

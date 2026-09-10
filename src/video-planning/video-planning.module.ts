import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import videoPlanningConfig from './config/video-planning.config';
import { VideoPlannerProvider } from './providers/video-planner.provider';

@Module({
  imports: [ConfigModule.forFeature(videoPlanningConfig)],
  providers: [VideoPlannerProvider],
  exports: [VideoPlannerProvider],
})
export class VideoPlanningModule {}

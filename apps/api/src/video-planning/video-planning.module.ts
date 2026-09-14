import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAiModule } from '../openai/openai.module';
import videoPlanningConfig from './config/video-planning.config';
import { VideoPlannerProvider } from './providers/video-planner.provider';

@Module({
  imports: [ConfigModule.forFeature(videoPlanningConfig), OpenAiModule],
  providers: [VideoPlannerProvider],
  exports: [VideoPlannerProvider],
})
export class VideoPlanningModule {}

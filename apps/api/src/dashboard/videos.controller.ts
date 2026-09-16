import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type {
  GenerateVideoRequest,
  VideoSummary,
} from '@reellora/shared';
import { DashboardService } from './dashboard.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('generate')
  async generateVideo(
    @Query() request: GenerateVideoRequest,
  ): Promise<{ videoId: string; status: string }> {
    if (!request.newsItemId) {
      throw new NotFoundException('newsItemId is required');
    }
    const video = await this.dashboardService.requestVideoGeneration(
      request.newsItemId,
    );
    return { videoId: video.id, status: video.status };
  }

  @Get()
  async listVideos(
    @Query('limit') limit?: string,
  ): Promise<VideoSummary[]> {
    const videos = await this.dashboardService.listVideos(
      limit ? Number(limit) : undefined,
    );
    return videos as unknown as VideoSummary[];
  }

  @Get(':id/status')
  async getVideoStatus(
    @Param('id') videoId: string,
  ): Promise<VideoSummary> {
    const video = await this.dashboardService.getVideoStatus(videoId);
    return video as unknown as VideoSummary;
  }
}

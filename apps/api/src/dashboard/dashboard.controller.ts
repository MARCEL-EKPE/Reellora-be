import { Controller, Get, Query } from '@nestjs/common';
import type { ApiResponse, FeedItem } from '@reellora/shared';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('feed')
  async getFeed(
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ): Promise<ApiResponse<FeedItem[]>> {
    const items = await this.dashboardService.getFeed(
      category,
      limit ? Number(limit) : undefined,
    );
    return { data: items as unknown as FeedItem[] };
  }
}

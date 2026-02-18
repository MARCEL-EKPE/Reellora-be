import { Module } from '@nestjs/common';
import { MediaScrapperService } from './providers/media-scrapper.service';
import { FeedDiscoveryProvider } from './providers/feed-discovery.provider';
import { HeadlineAnalysisProvider } from './providers/headline-analysis.provider';
import { AiHeadlineAnalysisProvider } from './providers/ai-headline-analysis.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MediaScrapperService, FeedDiscoveryProvider, HeadlineAnalysisProvider, AiHeadlineAnalysisProvider],
  exports: [MediaScrapperService],
})
export class MediaScrapperModule { }

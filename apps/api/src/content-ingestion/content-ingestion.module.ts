import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineCoreModule } from '../pipeline-core/pipeline-core.module';
import contentIngestionConfig from './config/content-ingestion.config';
import contentSourcesConfig from './config/content-sources.config';
import { ContentIngestionService } from './providers/content-ingestion.service';
import { NewsItemIngestionService } from './providers/news-item-ingestion.service';
import {
  ContentSourceIngestionProvider,
  RssContentSourceFetcher,
} from './providers/content-source-ingestion.provider';

@Module({
  imports: [
    ConfigModule.forFeature(contentIngestionConfig),
    ConfigModule.forFeature(contentSourcesConfig),
    PipelineCoreModule,
  ],
  providers: [
    ContentIngestionService,
    NewsItemIngestionService,
    ContentSourceIngestionProvider,
    {
      provide: 'CONTENT_SOURCE_FETCHER',
      useClass: RssContentSourceFetcher,
    },
  ],
  exports: [ContentIngestionService, NewsItemIngestionService],
})
export class ContentIngestionModule {}

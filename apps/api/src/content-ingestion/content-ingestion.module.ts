import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineCoreModule } from '../pipeline-core/pipeline-core.module';
import contentIngestionConfig from './config/content-ingestion.config';
import contentSourcesConfig from './config/content-sources.config';
import { ContentIngestionService } from './providers/content-ingestion.service';
import { ArticleIngestionService } from './providers/article-ingestion.service';
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
    ArticleIngestionService,
    ContentSourceIngestionProvider,
    {
      provide: 'CONTENT_SOURCE_FETCHER',
      useClass: RssContentSourceFetcher,
    },
  ],
  exports: [ContentIngestionService, ArticleIngestionService],
})
export class ContentIngestionModule {}

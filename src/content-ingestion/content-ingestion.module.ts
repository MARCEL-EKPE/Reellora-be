import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContentIngestionService } from './providers/content-ingestion.service';
import {
    ContentSourceIngestionProvider,
    RssContentSourceFetcher,
} from './providers/content-source-ingestion.provider';

@Module({
    imports: [ConfigModule],
    providers: [
        ContentIngestionService,
        ContentSourceIngestionProvider,
        {
            provide: 'CONTENT_SOURCE_FETCHER',
            useClass: RssContentSourceFetcher,
        },
    ],
    exports: [ContentIngestionService],
})
export class ContentIngestionModule { }

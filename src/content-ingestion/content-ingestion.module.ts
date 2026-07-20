import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContentIngestionService } from './providers/content-ingestion.service';
import {
    ContentSourceFetcher,
    ContentSourceIngestionProvider,
} from './providers/content-source-ingestion.provider';

class DefaultContentSourceFetcher implements ContentSourceFetcher {
    async fetch() {
        return [];
    }
}

@Module({
    imports: [ConfigModule],
    providers: [
        ContentIngestionService,
        ContentSourceIngestionProvider,
        {
            provide: 'CONTENT_SOURCE_FETCHER',
            useClass: DefaultContentSourceFetcher,
        },
    ],
    exports: [ContentIngestionService],
})
export class ContentIngestionModule { }

import { Injectable } from '@nestjs/common';
import { ContentSourceIngestionProvider } from './content-source-ingestion.provider';

@Injectable()
export class ContentIngestionService {
    constructor(
        private readonly contentSourceIngestionProvider: ContentSourceIngestionProvider,
    ) { }

    async discoverFeeds() {
        return this.contentSourceIngestionProvider.ingestSources();
    }
}

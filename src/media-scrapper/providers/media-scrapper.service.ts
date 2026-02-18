import { Injectable } from '@nestjs/common';
import { FeedDiscoveryProvider } from './feed-discovery.provider';

@Injectable()
export class MediaScrapperService {

    constructor(
        private readonly feedDiscoveryProvider: FeedDiscoveryProvider,
    ) { }


    async discoverFeeds() {
        return this.feedDiscoveryProvider.discoverFeeds();
    }
}

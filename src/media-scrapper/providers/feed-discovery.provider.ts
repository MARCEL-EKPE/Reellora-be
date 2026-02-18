import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import IORedis from 'ioredis';
import { articleFeeds, videoFeeds } from '../feeds';
import { HeadlineAnalysisProvider } from './headline-analysis.provider';
import { AiHeadlineAnalysisProvider } from './ai-headline-analysis.provider';

@Injectable()
export class FeedDiscoveryProvider {
    private redis: IORedis;

    constructor(
        private readonly headlineAnalysisProvider: HeadlineAnalysisProvider,
        private readonly aiHeadlineAnalysisProvider: AiHeadlineAnalysisProvider
    ) {
        // Initialize Redis connection (localhost:6379)
        this.redis = new IORedis({
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
        });
    }

    private logger = new Logger(FeedDiscoveryProvider.name);
    private parser = new Parser();

    async discoverFeeds() {
        const urls: String[] = [];
        for (const feedUrl of videoFeeds) {

            try {
                const result = await this.parser.parseURL(feedUrl);
                for (const item of result.items) {

                    const title = item.title || '';
                    const link = item.link || '';
                    const videoId = item.id || link;

                    // Check if video was already processed (cached)
                    const cachedVideo = await this.redis.exists(videoId);
                    if (cachedVideo) {
                        this.logger.debug(`Skipped (already processed): ${title}`)
                        continue;
                    }

                    if (link.includes('/shorts/')) {
                        this.logger.debug(`Rejected: ${title} (YouTube Short)`);
                        continue;
                    }

                    // const score = this.headlineAnalysisProvider.calculateScore(title);
                    const aiScore = await this.aiHeadlineAnalysisProvider.scoreHeadline(title);

                    if (aiScore >= 8) {
                        urls.push(link);

                        // Cache the video ID for 24 hours (86400 seconds)
                        await this.redis.setex(videoId, 86400, '1');

                        // this.logger.log(`Accepted: ${title} (AI score: ${score})`);
                        this.logger.log(`Accepted: ${title} (AI score: ${aiScore})`);
                    } else {
                        // this.logger.debug(`Rejected: ${title} (score: ${score})`);
                        this.logger.debug(`Rejected: ${title} (AI score: ${aiScore})`);
                    }
                }
            } catch (error) {
                this.logger.error(
                    `Failed to discover feeds from ${feedUrl}: ${error.message}`
                );
            }
        }

        return urls;
    }

}

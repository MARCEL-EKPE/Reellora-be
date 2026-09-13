import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    public readonly client: IORedis;

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('REDIS_HOST', 'localhost');
        const port = this.configService.get<number>('REDIS_PORT', 6379);

        this.client = new IORedis({
            host,
            port,
            maxRetriesPerRequest: null,
        });
    }

    async onModuleDestroy() {
        try {
            await this.client.quit();
        } catch (error) {
            this.logger.warn(`Failed to close Redis connection cleanly: ${error.message}`);
            this.client.disconnect();
        }
    }
}
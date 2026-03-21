import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import axios from 'axios';
import mediaProcessingConfig from '../config/media-processing.config';
import {
    IStockMediaProvider,
    LicenseStockVideoRequest,
    LicenseStockVideoResponse,
    SearchStockVideoRequest,
    SearchStockVideoResponse,
    StockVideoAsset,
} from '../interfaces/stock-media.interface';

@Injectable()
export class ShutterstockProvider implements IStockMediaProvider {
    private readonly logger = new Logger(ShutterstockProvider.name);

    constructor(
        @Inject(mediaProcessingConfig.KEY)
        private readonly config: ConfigType<typeof mediaProcessingConfig>,
    ) { }

    async searchVideos(request: SearchStockVideoRequest): Promise<SearchStockVideoResponse> {
        this.ensureCredentials();

        const page = Math.max(1, request.page ?? 1);
        const perPage = Math.min(200, Math.max(1, request.perPage ?? 20));
        const params: Record<string, string | number> = {
            query: request.query,
            page,
            per_page: perPage,
        };

        if (request.aspectRatio) params.aspect_ratio = request.aspectRatio;
        if (typeof request.minDurationSeconds === 'number') params.duration_from = request.minDurationSeconds;
        if (typeof request.maxDurationSeconds === 'number') params.duration_to = request.maxDurationSeconds;
        if (typeof request.minWidth === 'number') params.width_from = request.minWidth;
        if (typeof request.minHeight === 'number') params.height_from = request.minHeight;
        if (request.keywords?.length) params.keyword = request.keywords.join(' ');

        try {
            const response = await axios.get(
                `${this.config.shutterstockApiBase}/v2/videos/search`,
                {
                    params,
                    headers: this.buildAuthHeaders(),
                },
            );

            const payload = response.data ?? {};
            const items = Array.isArray(payload?.data) ? payload.data : [];
            const results: StockVideoAsset[] = items.map((item: any) => this.mapToStockAsset(item));

            return {
                provider: 'shutterstock',
                page,
                perPage,
                totalCount: Number(payload?.total_count ?? 0),
                results,
            };
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? `${err.response?.status ?? ''} ${err.response?.statusText ?? ''}`.trim() || err.message
                : err.message;
            this.logger.error(`Shutterstock search failed: ${message}`);
            throw new BadRequestException(`Shutterstock search failed: ${message}`);
        }
    }

    async licenseVideo(request: LicenseStockVideoRequest): Promise<LicenseStockVideoResponse> {
        this.ensureCredentials();

        try {
            const response = await axios.post(
                `${this.config.shutterstockApiBase}/v2/videos/licenses`,
                {
                    video_id: request.assetId,
                },
                {
                    headers: this.buildAuthHeaders(),
                },
            );

            const payload = response.data ?? {};
            return {
                provider: 'shutterstock',
                assetId: request.assetId,
                licensed: true,
                licenseId: payload?.data?.[0]?.id || payload?.id,
                downloadUrl: payload?.data?.[0]?.download?.url,
                raw: payload,
            };
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? `${err.response?.status ?? ''} ${err.response?.statusText ?? ''}`.trim() || err.message
                : err.message;
            this.logger.error(`Shutterstock license failed: ${message}`);
            throw new BadRequestException(`Shutterstock license failed: ${message}`);
        }
    }

    private ensureCredentials(): void {
        if (!this.config.shutterstockClientId || !this.config.shutterstockClientSecret) {
            throw new BadRequestException('Shutterstock API credentials are not configured');
        }
    }

    private buildAuthHeaders(): Record<string, string> {
        const credentials = Buffer.from(
            `${this.config.shutterstockClientId}:${this.config.shutterstockClientSecret}`,
        ).toString('base64');

        return {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
        };
    }

    private mapToStockAsset(item: any): StockVideoAsset {
        const previewUrl = item?.assets?.preview_mp4?.url || item?.assets?.preview_webm?.url;
        const sourceUrl = item?.assets?.hd?.url || item?.assets?.sd?.url || previewUrl;

        return {
            provider: 'shutterstock',
            assetId: String(item?.id ?? ''),
            title: item?.description || `Shutterstock video ${item?.id ?? ''}`,
            description: item?.description,
            durationSeconds: Number(item?.duration ?? 0) || undefined,
            width: Number(item?.aspect?.width ?? 0) || undefined,
            height: Number(item?.aspect?.height ?? 0) || undefined,
            previewUrl,
            sourceUrl,
            keywords: Array.isArray(item?.keywords)
                ? item.keywords.map((keyword: any) => String(keyword)).filter(Boolean)
                : undefined,
            raw: item,
        };
    }
}

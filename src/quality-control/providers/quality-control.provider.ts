import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import qualityControlConfig from '../config/quality-control.config';
import type { QualityCheckResult } from '../interfaces/quality-check.interface';

@Injectable()
export class QualityControlProvider {
    private readonly logger = new Logger(QualityControlProvider.name);

    constructor(
        @Inject(qualityControlConfig.KEY)
        private readonly config: ConfigType<typeof qualityControlConfig>,
    ) {}

    async validateVideo(
        videoId: string,
        finalOutputPath: string,
    ): Promise<QualityCheckResult> {
        this.logger.log(
            `Validating video ${videoId} at path ${finalOutputPath}`,
        );

        if (this.config.useMockQc) {
            return {
                passed: true,
                checks: {
                    durationSeconds: 0,
                    audioLevelDb: 0,
                    placeholder: true,
                },
            };
        }

        throw new BadRequestException('Real QC not implemented');
    }
}

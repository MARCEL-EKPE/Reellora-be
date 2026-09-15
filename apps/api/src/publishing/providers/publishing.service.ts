import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Platform } from '../../pipeline-core/enums/platform.enum';
import {
  PLATFORM_PUBLISHER,
  type PlatformPublisher,
  type PublishRequest,
  type PublishResult,
} from '../../shared/interfaces/publisher.interface';
import publishingConfig from '../config/publishing.config';

@Injectable()
export class PublishingService {
  constructor(
    @Inject(publishingConfig.KEY)
    private readonly config: ConfigType<typeof publishingConfig>,
    @Inject(PLATFORM_PUBLISHER)
    private readonly publishers: PlatformPublisher[],
  ) {}

  publish(platform: Platform, request: PublishRequest): Promise<PublishResult> {
    const provider = this.publishers.find(
      (publisher) =>
        publisher.platform ===
        (this.config.provider === 'mock' ? 'mock' : platform),
    );

    if (!provider) {
      throw new BadRequestException(
        `Publisher not configured for platform: ${platform}`,
      );
    }

    return provider.publish(request);
  }
}

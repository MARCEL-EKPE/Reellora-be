import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  PlatformPublisher,
  PublishRequest,
  PublishResult,
} from '../../pipeline-core/interfaces/publisher.interface';

@Injectable()
export class YouTubePublisherProvider implements PlatformPublisher {
  readonly platform = 'youtube';

  async publish(_request: PublishRequest): Promise<PublishResult> {
    throw new BadRequestException('YouTube publishing not yet implemented');
  }
}

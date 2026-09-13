import { Injectable } from '@nestjs/common';
import type {
  PlatformPublisher,
  PublishRequest,
  PublishResult,
} from '../../pipeline-core/interfaces/publisher.interface';

@Injectable()
export class MockPublisherProvider implements PlatformPublisher {
  readonly platform = 'mock';

  async publish(request: PublishRequest): Promise<PublishResult> {
    return {
      platformVideoId: `mock-${request.videoId}`,
      platformVideoUrl: `https://mock.publishing/${request.videoId}`,
      status: 'published',
      publishedAt: new Date(),
    };
  }
}

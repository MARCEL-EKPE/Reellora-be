import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from '../pipeline-core/entities/publication.entity';
import { Video } from '../pipeline-core/entities/video.entity';
import { PLATFORM_PUBLISHER } from '../pipeline-core/interfaces/publisher.interface';
import publishingConfig from './config/publishing.config';
import { MockPublisherProvider } from './providers/mock-publisher.provider';
import { PublishingService } from './providers/publishing.service';
import { YouTubePublisherProvider } from './providers/youtube-publisher.provider';

@Module({
  imports: [
    ConfigModule.forFeature(publishingConfig),
    TypeOrmModule.forFeature([Publication, Video]),
  ],
  providers: [
    MockPublisherProvider,
    YouTubePublisherProvider,
    PublishingService,
    {
      provide: PLATFORM_PUBLISHER,
      useFactory: (
        mock: MockPublisherProvider,
        youtube: YouTubePublisherProvider,
      ) => [mock, youtube],
      inject: [MockPublisherProvider, YouTubePublisherProvider],
    },
  ],
  exports: [PublishingService],
})
export class PublishingModule {}

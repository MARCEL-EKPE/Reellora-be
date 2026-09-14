import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import assetsConfig from '../config/assets.config';
import type {
  AssetStorage,
  AssetUploadRequest,
  StoredAsset,
} from '../../pipeline-core/interfaces/asset-storage.interface';

@Injectable()
export class S3AssetStorageProvider implements AssetStorage {
  private readonly logger = new Logger(S3AssetStorageProvider.name);

  constructor(
    @Inject(assetsConfig.KEY)
    private readonly config: ConfigType<typeof assetsConfig>,
  ) {
    if (this.config.provider === 's3') {
      if (
        !this.config.s3Bucket ||
        !this.config.s3AccessKeyId ||
        !this.config.s3SecretAccessKey
      ) {
        this.logger.warn(
          'S3 provider selected but required S3 configuration is missing',
        );
      }
    }
  }

  async upload(_request: AssetUploadRequest): Promise<StoredAsset> {
    this.ensureConfigured();
    throw new BadRequestException('S3 asset storage not fully implemented');
  }

  async download(_key: string): Promise<Buffer> {
    this.ensureConfigured();
    throw new BadRequestException('S3 asset storage not fully implemented');
  }

  async getSignedUrl(
    _key: string,
    _expiresInSeconds?: number,
  ): Promise<string> {
    this.ensureConfigured();
    throw new BadRequestException('S3 asset storage not fully implemented');
  }

  async delete(_key: string): Promise<void> {
    this.ensureConfigured();
    throw new BadRequestException('S3 asset storage not fully implemented');
  }

  private ensureConfigured(): void {
    if (this.config.provider !== 's3') {
      return;
    }

    if (
      !this.config.s3Bucket ||
      !this.config.s3AccessKeyId ||
      !this.config.s3SecretAccessKey
    ) {
      throw new BadRequestException('S3 asset storage not fully implemented');
    }
  }
}

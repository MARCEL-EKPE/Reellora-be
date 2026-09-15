import { Injectable, Inject } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import assetsConfig from '../config/assets.config';
import { S3AssetStorageProvider } from './s3-asset-storage.provider';
import { LocalAssetStorageProvider } from './local-asset-storage.provider';
import type {
  AssetStorage,
  AssetUploadRequest,
  StoredAsset,
} from '../../shared/interfaces/asset-storage.interface';

@Injectable()
export class AssetStorageService implements AssetStorage {
  private readonly activeProvider: AssetStorage;

  constructor(
    private readonly s3Provider: S3AssetStorageProvider,
    private readonly localProvider: LocalAssetStorageProvider,
    @Inject(assetsConfig.KEY)
    private readonly config: ConfigType<typeof assetsConfig>,
  ) {
    this.activeProvider =
      this.config.provider === 's3' ? this.s3Provider : this.localProvider;
  }

  upload(request: AssetUploadRequest): Promise<StoredAsset> {
    return this.activeProvider.upload(request);
  }

  download(key: string): Promise<Buffer> {
    return this.activeProvider.download(key);
  }

  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.activeProvider.getSignedUrl(key, expiresInSeconds);
  }

  delete(key: string): Promise<void> {
    return this.activeProvider.delete(key);
  }
}

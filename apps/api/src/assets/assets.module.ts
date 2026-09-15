import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import assetsConfig from './config/assets.config';
import { ASSET_STORAGE } from '../shared/interfaces/asset-storage.interface';
import { S3AssetStorageProvider } from './providers/s3-asset-storage.provider';
import { LocalAssetStorageProvider } from './providers/local-asset-storage.provider';
import { AssetStorageService } from './providers/asset-storage.service';

@Module({
  imports: [ConfigModule.forFeature(assetsConfig)],
  providers: [
    S3AssetStorageProvider,
    LocalAssetStorageProvider,
    AssetStorageService,
    {
      provide: ASSET_STORAGE,
      useFactory: (
        s3Provider: S3AssetStorageProvider,
        localProvider: LocalAssetStorageProvider,
        config: ReturnType<typeof assetsConfig>,
      ) => (config.provider === 's3' ? s3Provider : localProvider),
      inject: [
        S3AssetStorageProvider,
        LocalAssetStorageProvider,
        assetsConfig.KEY,
      ],
    },
  ],
  exports: [ASSET_STORAGE, AssetStorageService],
})
export class AssetsModule {}

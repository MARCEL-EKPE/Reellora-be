import { registerAs } from '@nestjs/config';

export default registerAs('assetsConfig', () => ({
    provider: (process.env.ASSET_STORAGE_PROVIDER as 's3' | 'local') || 'local',
    s3Region: process.env.S3_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET,
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    s3Endpoint: process.env.S3_ENDPOINT,
    localBasePath: process.env.LOCAL_ASSETS_BASE_PATH || './assets-storage',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('contentIngestionConfig', () => ({
  pollingIntervalMinutes: Number(
    process.env.CONTENT_POLLING_INTERVAL_MINUTES || '60',
  ),
  maxItemsPerSource: Number(process.env.CONTENT_MAX_ITEMS_PER_SOURCE || '20'),
  deduplicationStrategy: process.env.CONTENT_DEDUPLICATION_STRATEGY || 'url',
  defaultEnabled: process.env.CONTENT_INGESTION_ENABLED !== 'false',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('videoGenerationConfig', () => ({
  provider: process.env.VIDEO_GENERATION_PROVIDER || 'runway',
  runwayApiKey: process.env.RUNWAY_API_KEY,
  runwayApiBaseUrl: process.env.RUNWAY_API_BASE_URL || 'https://api.runwayml.com',
  useMockVideoGeneration: process.env.USE_MOCK_VIDEO_GENERATION === 'true' || false,
}));

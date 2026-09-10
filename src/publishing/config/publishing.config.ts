import { registerAs } from '@nestjs/config';

export default registerAs('publishingConfig', () => ({
  provider: process.env.PUBLISHING_PROVIDER || 'mock',
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
  youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI,
  defaultVisibility: process.env.DEFAULT_VISIBILITY || 'unlisted',
}));

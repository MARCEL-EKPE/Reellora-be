import { registerAs } from '@nestjs/config';

export default registerAs('openaiConfig', () => ({
    apiKey: process.env.OPENAI_API_KEY,
    apiBase: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com',
    chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
    visionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
}));

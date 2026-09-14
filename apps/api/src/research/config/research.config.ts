import { registerAs } from '@nestjs/config';

export default registerAs('researchConfig', () => ({
  model:
    process.env.RESEARCH_LLM_MODEL || process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  useMockResearch: process.env.USE_MOCK_RESEARCH?.toLowerCase() === 'true',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('researchConfig', () => ({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    llmModel: process.env.LLM_MODEL,
    useMockResearch: process.env.USE_MOCK_RESEARCH?.toLowerCase() === 'true',
}));

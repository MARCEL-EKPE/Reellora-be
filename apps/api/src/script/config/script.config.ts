import { registerAs } from '@nestjs/config';

export default registerAs('scriptConfig', () => ({
  model:
    process.env.SCRIPT_LLM_MODEL || process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  useMockScript: process.env.USE_MOCK_SCRIPT === 'true',
  targetDurationSeconds: Number(process.env.TARGET_DURATION_SECONDS ?? 420),
  maxScriptWords: Number(process.env.MAX_SCRIPT_WORDS ?? 1200),
}));

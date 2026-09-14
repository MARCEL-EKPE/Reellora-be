import { registerAs } from '@nestjs/config';

export default registerAs('videoPlanningConfig', () => ({
  model:
    process.env.VIDEO_PLANNING_LLM_MODEL ||
    process.env.OPENAI_CHAT_MODEL ||
    'gpt-4o',
  maxScenes: Number(process.env.MAX_SCENES ?? 10),
  defaultSceneDurationSeconds: Number(
    process.env.DEFAULT_SCENE_DURATION_SECONDS ?? 5,
  ),
  useMockPlanner: process.env.USE_MOCK_PLANNER === 'true',
}));

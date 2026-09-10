import { registerAs } from '@nestjs/config';

export default registerAs('videoPlanningConfig', () => ({
  maxScenes: Number(process.env.MAX_SCENES ?? 10),
  defaultSceneDurationSeconds: Number(process.env.DEFAULT_SCENE_DURATION_SECONDS ?? 5),
  useMockPlanner: process.env.USE_MOCK_PLANNER === 'true',
}));

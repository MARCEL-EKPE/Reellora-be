import { registerAs } from '@nestjs/config';

export default registerAs('qualityControlConfig', () => ({
    useMockQc: process.env.USE_MOCK_QC ? process.env.USE_MOCK_QC === 'true' : true,
    minVideoDurationSeconds: Number(process.env.MIN_VIDEO_DURATION_SECONDS || 60),
    maxVideoDurationSeconds: Number(process.env.MAX_VIDEO_DURATION_SECONDS || 600),
    minAudioLevelDb: Number(process.env.MIN_AUDIO_LEVEL_DB || -60),
}));

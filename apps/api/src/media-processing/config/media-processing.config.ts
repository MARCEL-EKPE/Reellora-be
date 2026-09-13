import { registerAs } from '@nestjs/config';

export default registerAs('mediaProcessingConfig', () => ({
  ffmpegPath: process.env.FFMPEG_PATH,
  ffprobePath: process.env.FFPROBE_PATH,
  useMockComposition: process.env.USE_MOCK_COMPOSITION !== 'false',
  finalOutputFormat: process.env.FINAL_OUTPUT_FORMAT || 'mp4',
  finalResolution: process.env.FINAL_RESOLUTION || '1920x1080',
  finalFrameRate: Number(process.env.FINAL_FRAME_RATE || 30),
}));

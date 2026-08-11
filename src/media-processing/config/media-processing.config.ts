import { registerAs } from "@nestjs/config";
import * as path from 'path';

export default registerAs('media-processingConfig', () => ({
    openAIApiKey: process.env.OPENAI_API_KEY,
    openAIApiBase: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com',
    openAIChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4',
    openAIVisionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicApiBase: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    anthropicApiVersion: process.env.ANTHROPIC_API_VERSION || '2023-06-01',
    ttsIntroVoice: process.env.TTS_INTRO_VOICE || 'onyx',
    shutterstockApiBase: process.env.SHUTTERSTOCK_API_BASE_URL || 'https://api.shutterstock.com',
    shutterstockClientId: process.env.SHUTTERSTOCK_CLIENT_ID,
    shutterstockClientSecret: process.env.SHUTTERSTOCK_CLIENT_SECRET,
    logoDetectionRequestStream: process.env.LOGO_REQUEST_STREAM || 'logo.detect.requested',
    logoDetectionResultStream: process.env.LOGO_RESULT_STREAM || 'logo.detect.results',
    logoDetectionTimeoutMs: Number(process.env.LOGO_DETECTION_TIMEOUT_MS || 180000),
    logoDetectionConf: Number(process.env.LOGO_DETECTION_CONF || 0.25),
    logoDetectionIou: Number(process.env.LOGO_DETECTION_IOU || 0.45),
    logoDetectionMinSegmentFrames: Number(process.env.LOGO_DETECTION_MIN_SEGMENT_FRAMES || 5),
    logoDetectionMaxFrameGap: Number(process.env.LOGO_DETECTION_MAX_FRAME_GAP || 3),
    logoDetectionContinuityIou: Number(process.env.LOGO_DETECTION_CONTINUITY_IOU || 0.3),
    logoDetectionWeights: process.env.LOGO_DETECTION_WEIGHTS,
    logoDetectionMaxFrames: process.env.LOGO_DETECTION_MAX_FRAMES ? Number(process.env.LOGO_DETECTION_MAX_FRAMES) : undefined,
}))
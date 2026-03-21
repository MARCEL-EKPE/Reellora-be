import { registerAs } from "@nestjs/config";

export default registerAs('media-processingConfig', () => ({
    openAIApiKey: process.env.OPENAI_API_KEY,
    openAIApiBase: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com',
    openAIChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4',
    openAIVisionModel: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
    ttsIntroVoice: process.env.TTS_INTRO_VOICE || 'onyx',
    shutterstockApiBase: process.env.SHUTTERSTOCK_API_BASE_URL || 'https://api.shutterstock.com',
    shutterstockClientId: process.env.SHUTTERSTOCK_CLIENT_ID,
    shutterstockClientSecret: process.env.SHUTTERSTOCK_CLIENT_SECRET,
}))
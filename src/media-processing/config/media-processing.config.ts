import { registerAs } from "@nestjs/config";

export default registerAs('media-processingConfig', () => ({
    openAIApiKey: process.env.OPENAI_API_KEY,
    openAIApiBase: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com',
    openAIChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4'
}))
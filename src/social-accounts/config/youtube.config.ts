import { registerAs } from "@nestjs/config";

export default registerAs('youtubeConfig', () => ({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI
}))
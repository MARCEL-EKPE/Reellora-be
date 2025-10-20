import { registerAs } from "@nestjs/config";

export default registerAs('appConfig', () => ({
    apiVersion: process.env.API_VERSION
    // environment: process.env.NODE_ENV || 'production'
}))
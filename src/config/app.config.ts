import { registerAs } from "@nestjs/config";

export default registerAs('appconfig', () => ({
    // environment: process.env.NODE_ENV || 'production'
}))
import { registerAs } from "@nestjs/config";

export default registerAs('appConfig', () => ({
    apiVersion: process.env.API_VERSION,
    // environment: process.env.NODE_ENV || 'production'
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    encryptionKey: process.env.ENCRYPTION_KEY
}))
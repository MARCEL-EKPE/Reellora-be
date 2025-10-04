import { registerAs } from "@nestjs/config"

export default registerAs('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNC === 'true' ? true : false,
    autoLoadEntities: process.env.DB_AUTOLOAD === 'true' ? true : false
}))


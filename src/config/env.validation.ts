import * as Joi from 'joi'

export default Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNC: Joi.boolean().required(),
    DB_AUTOLOAD: Joi.boolean().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
    JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
    JWT_REFRESH_TOKEN_TTL: Joi.number().required(),
    FACEBOOK_APP_ID: Joi.number().required(),
    FACEBOOK_CLIENT_SECRET: Joi.string().required(),
    API_VERSION: Joi.string().required(),
})
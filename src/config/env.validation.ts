import * as Joi from 'joi'

export default Joi.object({
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNC: Joi.boolean().required(),
    DB_AUTOLOAD: Joi.boolean().required(),
})
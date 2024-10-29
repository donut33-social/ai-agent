require('dotenv').config();
const { b64uDec } = require('../src/utils/helper')

module.exports = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: b64uDec(process.env.DB_PASSWORD),
    DB_NAME: process.env.DB_NAME,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PWD: b64uDec(process.env.REDIS_PWD),
    REDIS_EXPIRE_TIME: 1000 * 60,
}
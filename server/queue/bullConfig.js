const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Use external Redis URL if provided (standard in VPS setups), else fallback to local Redis
const redisConfig = process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379')
};

module.exports = {
    redis: redisConfig
}

const { Sequelize } = require('sequelize')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// ── Primary: MySQL ──
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: false,
        define: { timestamps: true, underscored: true },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        retry: { max: 3 }
    }
)

module.exports = sequelize

const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const SiteSetting = sequelize.define('SiteSetting', {
    key: { type: DataTypes.STRING(255), primaryKey: true },
    value: { type: DataTypes.TEXT },
}, {
    tableName: 'site_settings',
    timestamps: true,
})

module.exports = SiteSetting

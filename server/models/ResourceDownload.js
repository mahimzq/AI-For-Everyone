const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ResourceDownload = sequelize.define('ResourceDownload', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    resource_id: { type: DataTypes.INTEGER, allowNull: false },
    downloader_email: { type: DataTypes.STRING(255), allowNull: false },
    downloader_name: { type: DataTypes.STRING(255), defaultValue: '' },
}, {
    tableName: 'resource_downloads',
})

module.exports = ResourceDownload

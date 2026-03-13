const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Resource = sequelize.define('Resource', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    file_path: { type: DataTypes.STRING(500), allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_size: { type: DataTypes.INTEGER },
    download_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    uploaded_by: { type: DataTypes.INTEGER },
}, {
    tableName: 'resources'
})

module.exports = Resource

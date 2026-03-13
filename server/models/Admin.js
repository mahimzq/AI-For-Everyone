const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'viewer'), defaultValue: 'admin' },
    profile_picture: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
}, { tableName: 'admins' })

module.exports = Admin

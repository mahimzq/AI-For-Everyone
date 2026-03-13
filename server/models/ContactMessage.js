const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ContactMessage = sequelize.define('ContactMessage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    subject: { type: DataTypes.STRING(500), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
    replied_at: { type: DataTypes.DATE },
}, {
    tableName: 'contact_messages',
    updatedAt: false
})

module.exports = ContactMessage

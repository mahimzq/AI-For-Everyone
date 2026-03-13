const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    visitor_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    visitor_email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    visitor_phone: {
        type: DataTypes.STRING,
    },
    visitor_ip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    browser_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'waiting',  // waiting, active, ended
    },
    messages: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('messages')
            return raw ? JSON.parse(raw) : []
        },
        set(val) {
            this.setDataValue('messages', JSON.stringify(val))
        },
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'chat_sessions',
})

module.exports = ChatSession

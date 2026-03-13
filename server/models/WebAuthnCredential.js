const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const WebAuthnCredential = sequelize.define('WebAuthnCredential', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    public_key: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    counter: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    device_type: {
        type: DataTypes.STRING,
        defaultValue: 'singleDevice',
    },
    backed_up: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    transports: {
        type: DataTypes.TEXT,
        get() {
            const raw = this.getDataValue('transports')
            return raw ? JSON.parse(raw) : []
        },
        set(val) {
            this.setDataValue('transports', JSON.stringify(val))
        },
    },
}, {
    tableName: 'webauthn_credentials',
})

module.exports = WebAuthnCredential

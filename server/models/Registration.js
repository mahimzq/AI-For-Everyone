const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const crypto = require('crypto')

const Registration = sequelize.define('Registration', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    full_name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    country_code: { type: DataTypes.STRING(10), defaultValue: '+237' },
    transaction_id: { type: DataTypes.STRING(100), allowNull: false },
    profession: {
        type: DataTypes.ENUM('Student', 'Graduate', 'Job Seeker', 'Public Sector Worker', 'Private Sector Worker', 'Entrepreneur', 'Educator/Lecturer', 'Faith Leader', 'Other'),
        allowNull: false,
    },
    ai_experience: {
        type: DataTypes.ENUM('Complete Beginner', 'Heard of AI but never used it', 'Used ChatGPT/Claude a few times', 'Regular AI user'),
        allowNull: false,
    },
    learning_goals: { type: DataTypes.TEXT },
    referral_source: {
        type: DataTypes.ENUM('WhatsApp', 'Social Media', 'Friend/Colleague', 'Flyer/Poster', 'Website', 'Other'),
    },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'), defaultValue: 'pending' },
    confirmation_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
    qr_token: { type: DataTypes.STRING(36), unique: true },
}, {
    tableName: 'registrations',
    hooks: {
        beforeCreate: (registration) => {
            if (!registration.qr_token) {
                registration.qr_token = crypto.randomUUID()
            }
        }
    }
})

module.exports = Registration


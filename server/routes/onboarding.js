const express = require('express')
const router = express.Router()
const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const OnboardingEntry = sequelize.define('OnboardingEntry', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    full_name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    transaction_id: { type: DataTypes.STRING(200), allowNull: true },
}, { tableName: 'onboarding_entries', timestamps: true })

sequelize.sync()

// POST /api/onboarding — Public: store onboarding entry
router.post('/', async (req, res) => {
    try {
        const { full_name, email, phone, transaction_id } = req.body
        if (!full_name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email and phone are required.' })
        }
        const entry = await OnboardingEntry.upsert({ full_name, email, phone, transaction_id })
        res.status(201).json(entry)
    } catch (err) {
        res.status(500).json({ message: 'Failed to save' })
    }
})

module.exports = router

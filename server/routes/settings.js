const express = require('express')
const router = express.Router()
const SiteSetting = require('../models/SiteSetting')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')

// GET /api/settings/whatsapp-count — Public
router.get('/whatsapp-count', async (req, res) => {
    try {
        const setting = await SiteSetting.findByPk('whatsapp_member_count')
        res.json({ count: setting ? setting.value : '0' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch' })
    }
})

// POST /api/settings — Admin Only
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { key, value } = req.body
        if (!key) return res.status(400).json({ message: 'Key is required' })
        
        const [setting] = await SiteSetting.upsert({ key, value: String(value) })
        res.json(setting)
    } catch (err) {
        res.status(500).json({ message: 'Failed to save setting' })
    }
})

module.exports = router

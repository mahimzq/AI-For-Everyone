const express = require('express')
const router = express.Router()
const { Op, fn, col, literal } = require('sequelize')
const Registration = require('../models/Registration')
const { Resource, ResourceDownload } = require('../models/resourceAssociations')
const ContactMessage = require('../models/ContactMessage')
const SiteSetting = require('../models/SiteSetting')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')

// GET /api/analytics/overview
router.get('/overview', authMiddleware, async (req, res) => {
    try {
        const totalRegistrations = await Registration.count()
        const totalMessages = await ContactMessage.count()
        const unreadMessages = await ContactMessage.count({ where: { is_read: false } })
        const totalDownloads = await Resource.sum('download_count') || 0
        const daysUntilEvent = Math.ceil((new Date('2026-03-21') - new Date()) / (1000 * 60 * 60 * 24))

        // Fetch WhatsApp count
        const whatsappSetting = await SiteSetting.findByPk('whatsapp_member_count')
        const whatsappCount = whatsappSetting ? whatsappSetting.value : '0'

        res.json({ 
            totalRegistrations, 
            totalMessages, 
            unreadMessages, 
            totalDownloads, 
            daysUntilEvent, 
            whatsappCount,
            status: "ok" 
        })
    } catch (err) {
        console.error('⚠️ [Analytics] DB query failed, returning fallback stats:', err.message)
        res.json({ 
            totalRegistrations: 0, 
            totalMessages: 0, 
            unreadMessages: 0, 
            totalDownloads: 0, 
            daysUntilEvent: Math.ceil((new Date('2026-03-21') - new Date()) / (1000 * 60 * 60 * 24)),
            whatsappCount: '0',
            status: "fallback" 
        })
    }
})

// GET /api/analytics/registrations
router.get('/registrations', authMiddleware, async (req, res) => {
    try {
        const data = await Registration.findAll({
            attributes: [
                [fn('DATE', col('created_at')), 'date'],
                [fn('COUNT', col('id')), 'count'],
            ],
            group: [fn('DATE', col('created_at'))],
            order: [[fn('DATE', col('created_at')), 'ASC']],
            raw: true,
        })
        res.json(data)
    } catch (err) {
        res.json([]) // Fallback to empty array
    }
})

// GET /api/analytics/professions
router.get('/professions', authMiddleware, async (req, res) => {
    try {
        const data = await Registration.findAll({
            attributes: ['profession', [fn('COUNT', col('id')), 'count']],
            group: ['profession'],
            raw: true,
        })
        res.json(data)
    } catch (err) {
        res.json([]) // Fallback
    }
})

// GET /api/analytics/experience
router.get('/experience', authMiddleware, async (req, res) => {
    try {
        const data = await Registration.findAll({
            attributes: ['ai_experience', [fn('COUNT', col('id')), 'count']],
            group: ['ai_experience'],
            raw: true,
        })
        res.json(data)
    } catch (err) {
        res.json([]) // Fallback
    }
})

// GET /api/analytics/referrals
router.get('/referrals', authMiddleware, async (req, res) => {
    try {
        const data = await Registration.findAll({
            attributes: ['referral_source', [fn('COUNT', col('id')), 'count']],
            where: { referral_source: { [Op.ne]: null } },
            group: ['referral_source'],
            raw: true,
        })
        res.json(data)
    } catch (err) {
        res.json([]) // Fallback
    }
})

// GET /api/analytics/downloads — Recent activity
router.get('/downloads', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const downloads = await ResourceDownload.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Resource,
                as: 'resource',
                attributes: ['title']
            }]
        })
        res.json(downloads)
    } catch (err) {
        console.error('Failed to fetch download analytics:', err)
        res.status(500).json({ message: 'Failed to fetch' })
    }
})

module.exports = router

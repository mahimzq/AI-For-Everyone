const express = require('express')
const router = express.Router()
const Registration = require('../models/Registration')
const MarketingCampaign = require('../models/MarketingCampaign')
const authMiddleware = require('../middleware/authMiddleware')
const { requireRole } = require('../middleware/roleMiddleware')
const { sendMarketingEmail } = require('../utils/mailer')

// POST /api/marketing/send — Admin & Moderator Only
router.post('/send', authMiddleware, requireRole('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { subject, htmlBody, targetAudience, specificEmail, customEmails, imageBase64 } = req.body

        if (!subject || !htmlBody) {
            return res.status(400).json({ message: 'Subject and Email Body are required.' })
        }

        let users

        if (targetAudience === 'specific') {
            if (!specificEmail) {
                return res.status(400).json({ message: 'A recipient email address is required for specific sends.' })
            }
            const user = await Registration.findOne({ where: { email: specificEmail }, attributes: ['email', 'full_name'] })
            // If not in DB, still send using email as name
            users = [user || { email: specificEmail, full_name: specificEmail.split('@')[0] }]
        } else if (targetAudience === 'custom') {
            if (!customEmails || customEmails.length === 0) {
                return res.status(400).json({ message: 'Please add at least one email address.' })
            }
            // For each custom email, try to find the name from DB, fallback to email prefix
            const dbUsers = await Registration.findAll({
                where: { email: customEmails },
                attributes: ['email', 'full_name'],
            })
            const dbMap = {}
            dbUsers.forEach(u => { dbMap[u.email] = u.full_name })
            users = customEmails.map(email => ({
                email,
                full_name: dbMap[email] || email.split('@')[0],
            }))
        } else {
            const where = {}
            if (targetAudience === 'confirmed') where.status = 'confirmed'
            else if (targetAudience === 'pending') where.status = 'pending'
            else if (targetAudience === 'cancelled') where.status = 'cancelled'

            users = await Registration.findAll({ where, attributes: ['email', 'full_name'] })
        }

        if (users.length === 0) {
            return res.status(404).json({ message: 'No registered users match this target audience.' })
        }

        // Save campaign to history
        const campaign = await MarketingCampaign.create({
            subject,
            html_body: htmlBody,
            target_audience: targetAudience,
            specific_email: targetAudience === 'custom' ? customEmails.join(', ') : (specificEmail || null),
            has_image: !!imageBase64,
            total_sent: users.length,
            sent_by: req.user?.username || req.user?.email || 'admin',
        })

        // Respond immediately so frontend doesn't wait
        res.status(200).json({
            message: `Email broadcast started for ${users.length} users.`,
            totalTargets: users.length,
            campaignId: campaign.id,
        })

        // Background processing
        ;(async () => {
            let successCount = 0
            let failCount = 0
            for (const user of users) {
                const sent = await sendMarketingEmail(user.email, user.full_name, subject, htmlBody, imageBase64 || null)
                if (sent) successCount++
                else failCount++
                await new Promise(r => setTimeout(r, 200))
            }
            console.log(`📢 Marketing Broadcast Finished: ${successCount} sent, ${failCount} failed.`)
        })()

    } catch (err) {
        console.error('Marketing route error:', err)
        res.status(500).json({ message: 'Server error processing marketing request.', error: err.message })
    }
})

// GET /api/marketing/history
router.get('/history', authMiddleware, requireRole('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const campaigns = await MarketingCampaign.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50,
        })
        res.json(campaigns)
    } catch (err) {
        console.error('Marketing history error:', err)
        res.status(500).json({ message: 'Failed to fetch marketing history.' })
    }
})

module.exports = router

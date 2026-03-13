const express = require('express')
const router = express.Router()
const Registration = require('../models/Registration')
const authMiddleware = require('../middleware/authMiddleware')
const { requireRole } = require('../middleware/roleMiddleware')
const { sendMarketingEmail } = require('../utils/mailer')
const { Op } = require('sequelize')

// POST /api/marketing/send — Admin & Moderator Only
router.post('/send', authMiddleware, requireRole('super_admin', 'admin', 'moderator'), async (req, res) => {
    try {
        const { subject, htmlBody, targetAudience } = req.body

        if (!subject || !htmlBody) {
            return res.status(400).json({ message: 'Subject and Email Body are required.' })
        }

        // Determine who gets the email
        const where = {}
        if (targetAudience === 'confirmed') where.status = 'confirmed'
        else if (targetAudience === 'pending') where.status = 'pending'
        else if (targetAudience === 'cancelled') where.status = 'cancelled'
        // 'all' means no filter

        const users = await Registration.findAll({ where, attributes: ['email', 'full_name'] })

        if (users.length === 0) {
            return res.status(404).json({ message: 'No registered users match this target audience.' })
        }

        // Send emails asynchronously without blocking the response
        let successCount = 0
        let failCount = 0

        // In a very large app, you'd use a queue (BullMQ/Redis)
        // For standard small-to-medium events, Promise.all/loops are sufficient
        // We do them sequentially or batched to avoid hitting SMTP rate limits instantly

        // Respond immediately to the frontend so it doesn't wait
        res.status(200).json({
            message: `Email broadcast started for ${users.length} users.`,
            totalTargets: users.length
        })

            // Background Processing
            ; (async () => {
                for (const user of users) {
                    const sent = await sendMarketingEmail(user.email, user.full_name, subject, htmlBody)
                    if (sent) successCount++
                    else failCount++

                    // Slight delay to be nice to SMTP server
                    await new Promise(r => setTimeout(r, 200))
                }
                console.log(`📢 Marketing Broadcast Finished: ${successCount} sent, ${failCount} failed.`)
            })()

    } catch (err) {
        console.error('Marketing route error:', err)
        res.status(500).json({ message: 'Server error processing marketing request.', error: err.message })
    }
})

module.exports = router

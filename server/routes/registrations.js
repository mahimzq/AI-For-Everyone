const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const Registration = require('../models/Registration')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const { registrationRules, handleValidation } = require('../middleware/validateInput')
const { sendConfirmationEmail } = require('../utils/mailer')
const registrationQueue = require('../queue/registrationQueue')

// Helper: check if registration is closed (22:00 UK time)
function isRegistrationClosed() {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        hour12: false
    }).formatToParts(new Date())
    const hour = parseInt(parts.find(p => p.type === 'hour').value)
    return hour >= 22
}

// GET /api/registrations/status — Public: check if registration is open
router.get('/status', (_req, res) => {
    res.json({ closed: isRegistrationClosed() })
})

// POST /api/registrations — Public (Queue-First)
router.post('/', registrationRules, handleValidation, async (req, res) => {
    if (isRegistrationClosed()) {
        return res.status(403).json({ message: 'Registration is now closed. Please contact the organizer.' })
    }
    try {
        // Enqueue to Redis via BullMQ (Survives crashes, auto-retries)
        const job = await registrationQueue.add(req.body, { 
            attempts: 5, 
            backoff: 5000 
        })
        console.log(`✅ [API] Registration queued (JobID: ${job.id})`)
        
        // Respond immediately, worker will handle database operations
        res.status(202).json({
            message: 'Registration received and queued. It will be processed shortly.',
            status: "queued",
            queued: true,
            jobId: job.id,
        })
    } catch (err) {
        console.error('🔴 [Registration] Failed to add to queue:', err.message)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

// POST /api/registrations/admin — Admin manual registration (bypasses deadline)
router.post('/admin', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { full_name, email, phone, country_code, profession, ai_experience, transaction_id, referral_source } = req.body
        if (!full_name || !email || !phone) {
            return res.status(400).json({ message: 'full_name, email and phone are required.' })
        }
        const existing = await Registration.findOne({ where: { email } })
        if (existing) return res.status(409).json({ message: 'Email already registered.' })

        const crypto = require('crypto')
        const reg = await Registration.create({
            full_name,
            email,
            phone,
            country_code: country_code || '+237',
            profession: profession || 'Other',
            ai_experience: ai_experience || '',
            transaction_id: transaction_id || '',
            referral_source: referral_source || '',
            status: 'confirmed',
            qr_token: crypto.randomUUID(),
            confirmation_sent: false,
        })

        // Send confirmation email
        try {
            await sendConfirmationEmail(reg)
            await reg.update({ confirmation_sent: true })
        } catch (emailErr) {
            console.error('Admin reg: email failed:', emailErr.message)
        }

        const io = req.app.get('io')
        if (io) io.to('admins').emit('admin:new_registration', { id: reg.id })

        res.status(201).json({ message: 'Registration created successfully.', registration: reg })
    } catch (err) {
        console.error('Admin manual registration error:', err.message)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

// POST /api/registrations/sync — Accept offline registrations from frontend localStorage
router.post('/sync', async (req, res) => {
    try {
        const { registrations } = req.body
        if (!Array.isArray(registrations) || registrations.length === 0) {
            return res.status(400).json({ message: 'No registrations to sync.' })
        }

        let queued = 0
        let duplicates = 0

        for (const reg of registrations) {
            // Basic validation
            if (!reg.email || !reg.full_name) {
                continue
            }

            // Check for duplicate
            try {
                const existing = await Registration.findOne({ where: { email: reg.email } })
                if (existing) {
                    duplicates++
                    continue
                }
            } catch {
                // DB unreachable — just queue it, the worker will handle duplicates
            }

            await registrationQueue.add(reg, { attempts: 5, backoff: 5000 })
            queued++
        }

        console.log(`📲 [Sync] Received ${registrations.length} offline registrations: ${queued} queued, ${duplicates} duplicates skipped`)
        res.status(200).json({ message: `Synced: ${queued} queued, ${duplicates} duplicates skipped.`, queued, duplicates })
    } catch (err) {
        console.error('Sync error:', err.message)
        res.status(500).json({ message: 'Sync failed', error: err.message })
    }
})

// GET /api/registrations/verify/:token — Public Verification Endpoint
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params
        const reg = await Registration.findOne({
            where: { qr_token: token },
            attributes: ['id', 'full_name', 'email', 'status', 'profession']
        })

        if (!reg) {
            return res.status(404).json({ valid: false, message: 'Invalid or unrecognized ticket.' })
        }

        if (reg.status !== 'confirmed') {
            return res.status(403).json({ 
                valid: false, 
                message: 'Ticket is not confirmed.',
                registration: { full_name: reg.full_name, status: reg.status }
            })
        }

        return res.json({
            valid: true,
            message: 'Ticket is valid.',
            registration: {
                full_name: reg.full_name,
                email: reg.email, // Masked or partial email could be used here if needed, but it's okay.
                status: reg.status,
                profession: reg.profession
            }
        })
    } catch (error) {
        console.error('Verification error:', error)
        res.status(500).json({ valid: false, message: 'Server error during verification.' })
    }
})

// GET /api/registrations/queue-stats — Admin: view queue health
router.get('/queue-stats', authMiddleware, async (req, res) => {
    try {
        const stats = await registrationQueue.getJobCounts()
        res.json(stats)
    } catch (e) {
        res.json({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 })
    }
})

// GET /api/registrations — Admin
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, profession, ai_experience, status, sort = 'created_at', order = 'DESC' } = req.query
        const where = {}
        if (search) where[Op.or] = [{ full_name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
        if (profession) where.profession = profession
        if (ai_experience) where.ai_experience = ai_experience
        if (status) where.status = status

        const { rows, count } = await Registration.findAndCountAll({
            where,
            order: [[sort, order]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        })

        res.json({ registrations: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// GET /api/registrations/stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const total = await Registration.count()
        const confirmed = await Registration.count({ where: { status: 'confirmed' } })
        const pending = await Registration.count({ where: { status: 'pending' } })
        const cancelled = await Registration.count({ where: { status: 'cancelled' } })
        res.json({ total, confirmed, pending, cancelled })
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/registrations/export — CSV
router.get('/export', authMiddleware, async (req, res) => {
    try {
        const registrations = await Registration.findAll({ raw: true })
        const { Parser } = require('json2csv')
        const fields = ['id', 'full_name', 'email', 'phone', 'country_code', 'transaction_id', 'profession', 'ai_experience', 'referral_source', 'status', 'created_at']
        const parser = new Parser({ fields })
        const csv = parser.parse(registrations)

        res.header('Content-Type', 'text/csv')
        res.attachment('registrations.csv')
        res.send(csv)
    } catch (err) {
        res.status(500).json({ message: 'Export failed', error: err.message })
    }
})



// GET /api/registrations/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const reg = await Registration.findByPk(req.params.id)
        if (!reg) return res.status(404).json({ message: 'Not found' })
        res.json(reg)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/registrations/:id/resend-email
router.post('/:id/resend-email', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const reg = await Registration.findByPk(req.params.id)
        if (!reg) return res.status(404).json({ message: 'Not found' })

        const sent = await sendConfirmationEmail(reg)
        if (sent) {
            await reg.update({ confirmation_sent: true })
            res.json({ message: 'Email resent successfully' })
        } else {
            res.status(500).json({ message: 'Failed to resend email. Please check SMTP credentials.' })
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// PATCH /api/registrations/:id
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const reg = await Registration.findByPk(req.params.id)
        if (!reg) return res.status(404).json({ message: 'Not found' })

        // Check if status is changing to 'confirmed'
        const isConfirming = req.body.status === 'confirmed' && reg.status !== 'confirmed'
        
        await reg.update(req.body)

        // If newly confirmed and no email sent yet, send confirmation
        if (isConfirming && !reg.confirmation_sent) {
            const { sendConfirmationEmail } = require('../utils/mailer')
            await sendConfirmationEmail(reg)
        }
        const io = req.app.get('io')
        if (io) {
            io.to('admins').emit('admin:registration_updated', {
                id: reg.id,
                status: reg.status,
                updatedAt: reg.updatedAt,
            })
        }
        res.json(reg)
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message })
    }
})

// DELETE /api/registrations/:id
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const reg = await Registration.findByPk(req.params.id)
        if (!reg) return res.status(404).json({ message: 'Not found' })
        const deletedInfo = {
            id: reg.id,
            full_name: reg.full_name,
            email: reg.email,
        }
        await reg.destroy()
        const io = req.app.get('io')
        if (io) {
            io.to('admins').emit('admin:registration_deleted', deletedInfo)
        }
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' })
    }
})



module.exports = router

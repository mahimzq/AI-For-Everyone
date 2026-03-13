const express = require('express')
const router = express.Router()
const ContactMessage = require('../models/ContactMessage')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const { contactRules, handleValidation } = require('../middleware/validateInput')

// POST /api/contacts — Public
router.post('/', contactRules, handleValidation, async (req, res) => {
    try {
        const message = await ContactMessage.create(req.body)
        const io = req.app.get('io')
        if (io) {
            io.to('admins').emit('admin:new_contact_message', {
                id: message.id,
                name: message.name,
                email: message.email,
                subject: message.subject,
                is_read: message.is_read,
                is_archived: message.is_archived,
                createdAt: message.createdAt,
            })
        }
        res.status(201).json({ message: 'Message sent successfully', id: message.id })
    } catch (err) {
        res.status(500).json({ message: 'Failed to send message', error: err.message })
    }
})

// GET /api/contacts — Admin
router.get('/', authMiddleware, async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] })
        res.json(messages)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// PATCH /api/contacts/:id
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const msg = await ContactMessage.findByPk(req.params.id)
        if (!msg) return res.status(404).json({ message: 'Not found' })
        const previous = {
            is_read: msg.is_read,
            is_archived: msg.is_archived,
        }
        await msg.update(req.body)
        const io = req.app.get('io')
        if (io) {
            io.to('admins').emit('admin:contact_updated', {
                id: msg.id,
                previous,
                current: {
                    is_read: msg.is_read,
                    is_archived: msg.is_archived,
                },
                updatedAt: new Date().toISOString(),
            })
        }
        res.json(msg)
    } catch (err) {
        res.status(500).json({ message: 'Update failed' })
    }
})

// DELETE /api/contacts/:id
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const msg = await ContactMessage.findByPk(req.params.id)
        if (!msg) return res.status(404).json({ message: 'Not found' })
        const deletedInfo = {
            id: msg.id,
            is_read: msg.is_read,
            is_archived: msg.is_archived,
            name: msg.name,
            subject: msg.subject,
        }
        await msg.destroy()
        const io = req.app.get('io')
        if (io) {
            io.to('admins').emit('admin:contact_deleted', deletedInfo)
        }
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' })
    }
})

module.exports = router

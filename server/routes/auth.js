const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Admin = require('../models/Admin')
const authMiddleware = require('../middleware/authMiddleware')
const { loginRules, handleValidation } = require('../middleware/validateInput')

// Profile picture upload config
const avatarDir = path.join(__dirname, '..', 'uploads', 'profile-pictures')
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true })

const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, avatarDir),
        filename: (req, file, cb) => cb(null, `admin-${req.admin.id}-${Date.now()}${path.extname(file.originalname)}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/
        const ext = allowed.test(path.extname(file.originalname).toLowerCase())
        const mime = allowed.test(file.mimetype)
        cb(null, ext && mime)
    },
})

// POST /api/auth/login
router.post('/login', loginRules, handleValidation, async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await Admin.findOne({ where: { email } })
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' })

        const valid = await bcrypt.compare(password, admin.password_hash)
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role, profile_picture: admin.profile_picture } })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.admin.id, { attributes: { exclude: ['password_hash'] } })
        if (!admin) return res.status(404).json({ message: 'Admin not found' })
        res.json(admin)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// PATCH /api/auth/me — Update profile
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.admin.id)
        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        const { username, email } = req.body
        if (username) admin.username = username
        if (email) admin.email = email
        await admin.save()

        res.json({ id: admin.id, username: admin.username, email: admin.email, role: admin.role, profile_picture: admin.profile_picture })
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message })
    }
})

// POST /api/auth/me/avatar — Upload profile picture
router.post('/me/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

        const admin = await Admin.findByPk(req.admin.id)
        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        // Delete old picture if exists
        if (admin.profile_picture) {
            const oldPath = path.join(__dirname, '..', admin.profile_picture)
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
        }

        const filePath = `/uploads/profile-pictures/${req.file.filename}`
        admin.profile_picture = filePath
        await admin.save()

        res.json({ profile_picture: filePath, message: 'Profile picture updated' })
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message })
    }
})

// PATCH /api/auth/password — Change password
router.patch('/password', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.admin.id)
        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        const { currentPassword, newPassword } = req.body
        const valid = await bcrypt.compare(currentPassword, admin.password_hash)
        if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })

        admin.password_hash = await bcrypt.hash(newPassword, 12)
        await admin.save()

        res.json({ message: 'Password updated successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Password change failed', error: err.message })
    }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' })
})

// ==================
// TEAM MANAGEMENT (admin only)
// ==================
const { requireAdmin } = require('../middleware/roleMiddleware')

// GET /api/auth/team — List all team members
router.get('/team', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const team = await Admin.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['createdAt', 'DESC']],
        })
        res.json(team)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch team', error: err.message })
    }
})

// POST /api/auth/team — Create moderator account
router.post('/team', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' })
        }

        // Only allow creating moderator or viewer roles
        const allowedRoles = ['moderator', 'viewer']
        const newRole = allowedRoles.includes(role) ? role : 'moderator'

        const existing = await Admin.findOne({ where: { email } })
        if (existing) return res.status(409).json({ message: 'Email already exists' })

        const existingUsername = await Admin.findOne({ where: { username } })
        if (existingUsername) return res.status(409).json({ message: 'Username already taken' })

        const password_hash = await bcrypt.hash(password, 12)
        const newMember = await Admin.create({ username, email, password_hash, role: newRole })

        res.status(201).json({
            id: newMember.id,
            username: newMember.username,
            email: newMember.email,
            role: newMember.role,
        })
    } catch (err) {
        res.status(500).json({ message: 'Failed to create team member', error: err.message })
    }
})

// DELETE /api/auth/team/:id — Remove team member (can't remove self or super_admin)
router.delete('/team/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const memberId = parseInt(req.params.id)
        if (memberId === req.admin.id) {
            return res.status(400).json({ message: 'Cannot remove yourself' })
        }

        const member = await Admin.findByPk(memberId)
        if (!member) return res.status(404).json({ message: 'Team member not found' })
        if (member.role === 'super_admin') {
            return res.status(403).json({ message: 'Cannot remove a super admin' })
        }

        await member.destroy()
        res.json({ message: 'Team member removed' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove team member', error: err.message })
    }
})

module.exports = router

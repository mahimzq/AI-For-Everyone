const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Resource, ResourceDownload } = require('../models/resourceAssociations')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')

const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, '..', 'uploads', 'resources')

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + path.extname(file.originalname))
    },
})

const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true)
        else cb(new Error('Only PDF files allowed'), false)
    },
})

// POST /api/resources/upload — Admin
router.post('/upload', authMiddleware, requireAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
        const resource = await Resource.create({
            title: req.body.title || req.file.originalname,
            description: req.body.description || '',
            file_path: path.resolve(req.file.path),
            file_name: req.file.originalname,
            file_size: req.file.size,
            uploaded_by: req.admin.id,
        })
        res.status(201).json(resource)
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message })
    }
})

// GET /api/resources/admin — Admin
router.get('/admin', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const resources = await Resource.findAll({
            order: [['createdAt', 'DESC']],
        })
        res.json(resources)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/resources — Public
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.findAll({
            where: { is_active: true },
            order: [['createdAt', 'DESC']],
        })
        res.json(resources)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// GET /api/resources/:id/download — Public (but tracked)
router.get('/:id/download', async (req, res) => {
    try {
        const { email, name } = req.query
        if (!email) return res.status(400).json({ message: 'Email is required to download' })

        const resource = await Resource.findByPk(req.params.id)
        if (!resource || !resource.is_active) return res.status(404).json({ message: 'Not found' })

        // 1. Create tracking record
        await ResourceDownload.create({
            resource_id: resource.id,
            downloader_email: email,
            downloader_name: name || '',
        })

        // 2. Increment global download count
        await resource.increment('download_count')

        // 3. Serve the file
        res.download(resource.file_path, resource.file_name)
    } catch (err) {
        console.error('Download error:', err)
        res.status(500).json({ message: 'Download failed' })
    }
})

// GET /api/resources/:id/logs — Admin Only
router.get('/:id/logs', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const logs = await ResourceDownload.findAll({
            where: { resource_id: req.params.id },
            order: [['createdAt', 'DESC']],
        })
        res.json(logs)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch logs' })
    }
})

// PATCH /api/resources/:id — Admin
router.patch('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id)
        if (!resource) return res.status(404).json({ message: 'Not found' })
        await resource.update(req.body)
        res.json(resource)
    } catch (err) {
        res.status(500).json({ message: 'Update failed' })
    }
})

// DELETE /api/resources/:id — Admin
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id)
        if (!resource) return res.status(404).json({ message: 'Not found' })

        // Delete file from disk
        if (fs.existsSync(resource.file_path)) fs.unlinkSync(resource.file_path)
        await resource.destroy()
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' })
    }
})

module.exports = router

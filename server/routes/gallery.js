const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const GalleryPhoto = require('../models/GalleryPhoto')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')

const uploadDir = path.resolve(__dirname, '..', 'uploads', 'gallery')

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true)
        else cb(new Error('Only image files allowed'), false)
    },
})

// GET /api/gallery — Public
router.get('/', async (req, res) => {
    try {
        const photos = await GalleryPhoto.findAll({ order: [['createdAt', 'DESC']] })
        res.json(photos)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch gallery' })
    }
})

// POST /api/gallery — Admin: upload + compress one photo at a time
router.post('/', authMiddleware, requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' })

        // Duplicate check by original filename
        const existing = await GalleryPhoto.findOne({ where: { original_name: req.file.originalname } })
        if (existing) {
            fs.unlinkSync(req.file.path)
            return res.status(409).json({ message: 'Duplicate', photo: existing })
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`
        const compressedName = `c_${req.file.filename.replace(/\.[^.]+$/, '')}.jpg`
        const compressedPath = path.join(uploadDir, compressedName)

        // Compress: max 1920px wide, JPEG quality 80 (lossy)
        await sharp(req.file.path)
            .resize({ width: 1920, withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(compressedPath)

        fs.unlinkSync(req.file.path)

        const photo = await GalleryPhoto.create({
            filename: compressedName,
            original_name: req.file.originalname,
            caption: req.body.caption || null,
            url: `${baseUrl}/uploads/gallery/${compressedName}`,
        })

        res.status(201).json(photo)
    } catch (err) {
        res.status(500).json({ message: err.message || 'Upload failed' })
    }
})

// DELETE /api/gallery/:id — Admin
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const photo = await GalleryPhoto.findByPk(req.params.id)
        if (!photo) return res.status(404).json({ message: 'Photo not found' })
        const filePath = path.join(uploadDir, photo.filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        await photo.destroy()
        res.json({ message: 'Photo deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete photo' })
    }
})

module.exports = router

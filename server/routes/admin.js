const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const authMiddleware = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')

// Reusable PM2 restart command configuration for the Hostinger server environment
const PM2_BINARY = 'PM2=/var/www/ai4you.mindsetai.cloud/server/node_modules/.bin/pm2 && $PM2'
const START_SCRIPT = 'ecosystem.config.js'

/**
 * @route   POST /api/admin/restart-server
 * @desc    Restart the Node.js backend API process via PM2
 * @access  Private (Admin / Super Admin Only)
 */
router.post('/restart-server', authMiddleware, requireAdmin, (req, res) => {
    // Safety check (though requireAdmin middleware should caught this)
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Unauthorized: This action requires Administrator privileges.' })
    }

    console.log(`\n🔄 [SYSTEM] Server restart initiated by ${req.user.username} (${req.user.role})...`)

    // We send the response IMMEDIATELY back to the frontend so the UI doesn't hang.
    // The server will disconnect their Socket.IO temporarily anyway as it cycles.
    res.status(200).json({ message: 'Server restart initiated successfully.' })

    // Give the HTTP response 1 second to actually transmit over the network before pulling the plug
    setTimeout(() => {
        exec(`${PM2_BINARY} reload ${START_SCRIPT} --env production`, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ [PM2] Failed to execute restart command:', error.message)
                return
            }
            if (stderr) {
                console.error('⚠️ [PM2] Stderr output during restart:', stderr)
            }
            console.log('✅ [PM2] Restart command executed successfully:\n', stdout)
        })
    }, 1000)
})

module.exports = router

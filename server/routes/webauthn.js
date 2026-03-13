const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server')
const Admin = require('../models/Admin')
const WebAuthnCredential = require('../models/WebAuthnCredential')
const authMiddleware = require('../middleware/authMiddleware')
const Redis = require('ioredis')
const bullConfig = require('../queue/bullConfig')

// WebAuthn config
const rpName = 'AI For Everybody Admin'
const rpID = process.env.WEBAUTHN_RP_ID || (process.env.NODE_ENV === 'production' ? 'ai4you.mindsetai.cloud' : 'localhost')
const origin = process.env.WEBAUTHN_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://ai4you.mindsetai.cloud' : 'http://localhost:3000')

// Redis challenge store (supports PM2 cluster mode)
const redis = new Redis(bullConfig.redis)

// =============================
// REGISTRATION (requires login)
// =============================

// POST /api/webauthn/register/options — generate registration options
router.post('/register/options', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.admin.id)
        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        const existingCreds = await WebAuthnCredential.findAll({ where: { admin_id: admin.id } })
        const excludeCredentials = existingCreds.map(c => ({
            id: c.id,
            type: 'public-key',
            transports: c.transports,
        }))

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: String(admin.id),
            userName: admin.email,
            userDisplayName: admin.username || admin.email,
            attestationType: 'none',
            excludeCredentials,
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'required',
                authenticatorAttachment: 'platform', // Forces Face ID / Touch ID (built-in)
            },
        })

        // Store challenge in Redis (expires in 2 min)
        await redis.set(`webauthn:reg:${admin.id}`, options.challenge, 'EX', 120)

        res.json(options)
    } catch (err) {
        console.error('WebAuthn register options error:', err)
        res.status(500).json({ message: 'Failed to generate registration options' })
    }
})

// POST /api/webauthn/register/verify — verify registration response
router.post('/register/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.admin.id)
        if (!admin) return res.status(404).json({ message: 'Admin not found' })

        const expectedChallenge = await redis.get(`webauthn:reg:${admin.id}`)
        if (!expectedChallenge) return res.status(400).json({ message: 'Challenge expired, please try again' })

        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        })

        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({ message: 'Verification failed' })
        }

        const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

        // Store credential — convert Uint8Array to base64
        await WebAuthnCredential.create({
            id: Buffer.from(credentialID).toString('base64url'),
            admin_id: admin.id,
            public_key: Buffer.from(credentialPublicKey).toString('base64url'),
            counter,
            device_type: credentialDeviceType,
            backed_up: credentialBackedUp,
            transports: req.body.response?.transports || [],
        })

        await redis.del(`webauthn:reg:${admin.id}`)

        res.json({ verified: true, message: 'Biometric login has been set up successfully!' })
    } catch (err) {
        console.error('WebAuthn register verify error:', err)
        res.status(500).json({ message: 'Registration verification failed' })
    }
})

// =============================
// AUTHENTICATION (no login needed)
// =============================

// POST /api/webauthn/auth/options — generate auth options
router.post('/auth/options', async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ message: 'Email is required' })

        const admin = await Admin.findOne({ where: { email } })
        if (!admin) return res.status(404).json({ message: 'No account found', hasBiometric: false })

        const credentials = await WebAuthnCredential.findAll({ where: { admin_id: admin.id } })
        if (credentials.length === 0) {
            return res.json({ hasBiometric: false, message: 'No biometric credentials registered' })
        }

        const allowCredentials = credentials.map(c => ({
            id: c.id,
            type: 'public-key',
            transports: c.transports && c.transports.length > 0 ? c.transports : ['internal'],
        }))

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: 'required',
        })

        // Store challenge keyed by email
        await redis.set(`webauthn:auth:${email}`, JSON.stringify({ challenge: options.challenge, adminId: admin.id }), 'EX', 120)

        res.json({ ...options, hasBiometric: true })
    } catch (err) {
        console.error('WebAuthn auth options error:', err)
        res.status(500).json({ message: 'Failed to generate authentication options' })
    }
})

// POST /api/webauthn/auth/verify — verify auth response & issue JWT
router.post('/auth/verify', async (req, res) => {
    try {
        const { email, authResponse } = req.body
        if (!email || !authResponse) return res.status(400).json({ message: 'Missing data' })

        const storedStr = await redis.get(`webauthn:auth:${email}`)
        if (!storedStr) return res.status(400).json({ message: 'Challenge expired' })
        
        const stored = JSON.parse(storedStr)

        const credentialID = authResponse.id
        const credential = await WebAuthnCredential.findByPk(credentialID)
        if (!credential) return res.status(400).json({ message: 'Unknown credential' })

        const verification = await verifyAuthenticationResponse({
            response: authResponse,
            expectedChallenge: stored.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: Buffer.from(credential.id, 'base64url'),
                credentialPublicKey: Buffer.from(credential.public_key, 'base64url'),
                counter: credential.counter,
            },
        })

        if (!verification.verified) {
            return res.status(401).json({ message: 'Biometric verification failed' })
        }

        // Update counter
        await credential.update({ counter: verification.authenticationInfo.newCounter })

        // Issue JWT
        const admin = await Admin.findByPk(stored.adminId)
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )

        await redis.del(`webauthn:auth:${email}`)

        res.json({
            verified: true,
            token,
            admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
        })
    } catch (err) {
        console.error('WebAuthn auth verify error:', err)
        res.status(500).json({ message: 'Authentication failed' })
    }
})

// GET /api/webauthn/status — check if biometric is registered for an admin
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const creds = await WebAuthnCredential.findAll({ where: { admin_id: req.admin.id } })
        res.json({ registered: creds.length > 0, count: creds.length })
    } catch (err) {
        res.status(500).json({ message: 'Error checking status' })
    }
})

module.exports = router

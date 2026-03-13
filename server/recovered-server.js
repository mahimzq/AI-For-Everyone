const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const http = require('http')
const { Server } = require('socket.io')
const sequelize = require('./config/db')
const setupChat = require('./chatSocket')
const queueProcessor = require('./workers/queueProcessor')

const app = express()
const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5001

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,       // wait 60s before considering connection dead
    pingInterval: 25000,      // send ping every 25s to keep connection alive
    transports: ['websocket', 'polling'], // prefer websocket, fall back to polling
})

app.set('trust proxy', 1)
app.set('io', io)

// ── Security Middleware ──
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }))
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Rate Limiting ──
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
    validate: { xForwardedForHeader: false }
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many login attempts, please try again later.' },
    validate: { xForwardedForHeader: false }
})

app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)

// ── Static files (uploaded resources) ──
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
}, express.static(path.join(__dirname, 'uploads')))

// ── API Routes ──
app.use('/api/auth', require('./routes/auth'))
app.use('/api/registrations', require('./routes/registrations'))
app.use('/api/contacts', require('./routes/contacts'))
app.use('/api/resources', require('./routes/resources'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/webauthn', require('./routes/webauthn'))
app.use('/api/marketing', require('./routes/marketing'))

// ── Health check ──
app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown'
    try {
        await sequelize.authenticate()
        dbStatus = 'connected'
    } catch {
        dbStatus = 'disconnected'
    }
    res.json({
        status: 'ok',
        db: dbStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

// ── Serve static assets in production ──
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../client/dist')
    app.use(express.static(distPath))

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.sendFile(path.join(distPath, 'index.html'))
        }
    })
}

// ══════════════════════════════════════════════
// DATABASE RECONNECTION & HEARTBEAT
// ══════════════════════════════════════════════

let dbConnected = false

async function connectWithRetry(maxRetries = 10, delayMs = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await sequelize.authenticate()
            dbConnected = true
            console.log(`✅ Connected to database (attempt ${attempt})`)
            return true
        } catch (err) {
            console.error(`❌ DB connection attempt ${attempt}/${maxRetries} failed: ${err.message}`)
            if (attempt < maxRetries) {
                console.log(`⏳ Retrying in ${delayMs / 1000}s...`)
                await new Promise(r => setTimeout(r, delayMs))
            }
        }
    }
    dbConnected = false
    return false
}

// Periodic heartbeat — checks DB every 60s and reconnects if needed
function startDbHeartbeat() {
    setInterval(async () => {
        try {
            await sequelize.authenticate()
            if (!dbConnected) {
                console.log('✅ Database reconnected (heartbeat)')
                dbConnected = true
            }
        } catch (err) {
            if (dbConnected) {
                console.error('💔 Database connection lost (heartbeat):', err.message)
                dbConnected = false
            }
            // Attempt reconnect
            try {
                await sequelize.authenticate()
                dbConnected = true
                console.log('✅ Database auto-reconnected')
            } catch {
                console.error('⏳ Database still unreachable, will retry in 60s...')
            }
        }
    }, 60000) // every 60 seconds
}

// ══════════════════════════════════════════════
// PROCESS GUARDS — prevent unhandled crashes
// ══════════════════════════════════════════════

process.on('uncaughtException', (err) => {
    console.error('🔴 UNCAUGHT EXCEPTION — Exiting process so PM2 can restart:', err.message)
    console.error(err.stack)
    // Exit with failure (1) so PM2 detects the crash and restarts cleanly
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    console.error('🟡 UNHANDLED REJECTION (server still running):', reason)
})

// ══════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ══════════════════════════════════════════════

async function gracefulShutdown(signal) {
    console.log(`\n🛑 ${signal} received — shutting down gracefully...`)
    try {
        queueProcessor.stop()
        io.close()
        httpServer.close()
        await sequelize.close()
        console.log('✅ Cleanup complete')
    } catch (err) {
        console.error('Error during shutdown:', err.message)
    }
    process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ══════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════

const startServer = async () => {
    // Connect DB with retry
    const connected = await connectWithRetry(10, 5000)

    if (connected) {
        // Sync models
        require('./models/WebAuthnCredential')
        require('./models/ChatSession')
        await sequelize.sync()
        console.log('✅ Database models synced')

        // Start heartbeat monitoring
        startDbHeartbeat()
    } else {
        console.log('⚠️  Starting server without database (will keep retrying via heartbeat)...')
        // Still start heartbeat so it reconnects later
        startDbHeartbeat()
    }

    // Setup Socket.IO chat
    setupChat(io)
    console.log('💬 Live chat socket ready')

    // Start registration queue processor
    queueProcessor.start()

    // Start HTTP server
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`)
        console.log(`📊 API: http://localhost:${PORT}/api`)
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
}

startServer()

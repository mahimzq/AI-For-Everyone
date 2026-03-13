const Queue = require('bull')
const bullConfig = require('./bullConfig')
const nodemailer = require('nodemailer')
const Registration = require('../models/Registration')

const emailQueue = new Queue('emails', bullConfig)

// Set up the nodemailer transporter within the worker context
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

emailQueue.process(async (job) => {
    const { from, to, subject, html, registrationId, type } = job.data
    
    // Send email via SMTP
    await transporter.sendMail({ from, to, subject, html })
    
    // If it's a confirmation email, we can mark it as sent in the DB
    if (type === 'confirmation' && registrationId) {
        await Registration.update({ confirmation_sent: true }, { where: { id: registrationId } })
    }
})

// Process events for tracking (optional, good for debugging)
emailQueue.on('failed', (job, err) => {
    console.error(`❌ [EmailQueue] Job failed for ${job.data.to}: ${err.message}`)
})
emailQueue.on('completed', (job) => {
    console.log(`✉️ [EmailQueue] Successfully sent email to ${job.data.to}`)
})

module.exports = emailQueue

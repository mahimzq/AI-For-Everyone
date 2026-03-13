const Queue = require('bull')
const bullConfig = require('./bullConfig')
const Registration = require('../models/Registration')
const { sendConfirmationEmail, sendAdminNotificationEmail } = require('../utils/mailer')

const registrationQueue = new Queue('registrations', bullConfig)

// Process registration jobs
registrationQueue.process(async (job) => {
    const data = job.data

    try {
        // 1. Check for duplicate to avoid registering twice on retry
        const existing = await Registration.findOne({ where: { email: data.email } })
        if (existing) {
            console.log(`[RegistrationQueue] Email ${data.email} already registered — skipping duplicate.`)
            return true
        }

        // 2. Insert the registration
        const registration = await Registration.create(data)
        console.log(`✅ [RegistrationQueue] Inserted registration #${registration.id}: ${registration.full_name}`)
        
        // 3. Emit notification to admins via Socket.IO
        try {
            const { getIo } = require('../chatSocket')
            const io = getIo()
            if (io) {
                io.to('admins').emit('admin:new_registration', {
                    id: registration.id,
                    full_name: registration.full_name,
                    email: registration.email,
                    phone: registration.phone,
                    profession: registration.profession,
                    ai_experience: registration.ai_experience,
                    status: registration.status,
                    createdAt: registration.createdAt,
                })
            }
        } catch (e) {
            // Socket emission failure shouldn't fail the job
        }

        // 4. Enqueue the admin notification email ONLY (No immediate user confirmation email)
        await sendAdminNotificationEmail(registration)

        return true
    } catch (err) {
        console.error(`❌ [RegistrationQueue] Failed to process registration: ${err.message}`)
        throw err // Trigger Bull to retry based on backoff
    }
})

registrationQueue.on('failed', (job, err) => {
    console.error(`🔴 [RegistrationQueue] Job (attempts: ${job.attemptsMade}) failed: ${err.message}`)
})

module.exports = registrationQueue

require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = require('./config/db')
const Admin = require('./models/Admin')

const seedAdmin = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        const email = 'admin@mindset.com'
        const password = 'Admin123'

        const existing = await Admin.findOne({ where: { email } })
        if (existing) {
            console.log(`Admin user ${email} already exists. Updating password...`)
            const hash = await bcrypt.hash(password, 12)
            existing.password_hash = hash
            await existing.save()
            console.log('✅ Admin user password updated.')
            process.exit(0)
        }

        const hash = await bcrypt.hash(password, 12)
        await Admin.create({
            username: 'admin2',
            email,
            password_hash: hash,
            role: 'super_admin',
        })

        console.log(`✅ Admin user created: ${email}`)
        process.exit(0)
    } catch (err) {
        console.error('❌ Seed failed:', err)
        process.exit(1)
    }
}

seedAdmin()

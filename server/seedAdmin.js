require('dotenv').config()
const bcrypt = require('bcryptjs')
const sequelize = require('./config/db')
const Admin = require('./models/Admin')

const seedAdmin = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        const existing = await Admin.findOne({ where: { email: 'admin@mindset.com' } })
        if (existing) {
            console.log('Admin user already exists. Overwriting password to Admin123...')
            const hash = await bcrypt.hash('Admin123', 12)
            existing.password_hash = hash
            await existing.save()
            console.log('✅ Admin user password updated.')
            process.exit(0)
        }

        const hash = await bcrypt.hash('Admin123', 12)
        await Admin.create({
            username: 'mindset_admin',
            email: 'admin@mindset.com',
            password_hash: hash,
            role: 'super_admin',
        })

        console.log('✅ Admin user created:')
        console.log('   Email: admin@mindset.com')
        console.log('   Password: Admin123')
        console.log('   ⚠️  Change this password after first login!')
        process.exit(0)
    } catch (err) {
        console.error('❌ Seed failed:', err.message)
        process.exit(1)
    }
}

seedAdmin()

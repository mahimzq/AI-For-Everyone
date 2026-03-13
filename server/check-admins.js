const sequelize = require('./config/db')
const Admin = require('./models/Admin')

async function checkAdmins() {
    try {
        console.log('Connecting to database...')
        await sequelize.authenticate()
        console.log('Connected. Fetching admins...')
        const admins = await Admin.findAll()
        if (admins.length === 0) {
            console.log('❌ No admins found in the database.')
        } else {
            console.log(`✅ Found ${admins.length} admins:`)
            admins.forEach(a => console.log(`- ${a.email} (Role: ${a.role})`))
        }
    } catch (err) {
        console.error('❌ Failed:', err.message)
    } finally {
        await sequelize.close()
    }
}

checkAdmins()

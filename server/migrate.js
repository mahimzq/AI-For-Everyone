const sequelize = require('./config/db')

async function runMigration() {
    try {
        console.log('Connecting to database...')
        await sequelize.authenticate()
        console.log('Connected. Running ALTER TABLE...')
        await sequelize.query('ALTER TABLE admins ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL;')
        console.log('✅ Column profile_picture added successfully!')
    } catch (err) {
        if (err.parent && err.parent.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ Column already exists.')
        } else {
            console.error('❌ Migration failed:', err.message)
            console.error(err)
        }
    } finally {
        await sequelize.close()
    }
}

runMigration()

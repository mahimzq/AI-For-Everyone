const path = require('path');
const fs = require('fs');

// Load environment variables from the main server .env (one level up)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Sequelize } = require('sequelize');

// Target: Live MySQL
const mysqlDb = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: false,
    }
);

// Source: Recovered SQLite
const sqlitePath = path.join(__dirname, '..', 'recovered-database.sqlite');

if (!fs.existsSync(sqlitePath)) {
    throw new Error(`Recovered SQLite file not found at ${sqlitePath}`);
}

const sqliteDb = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false
});

async function mergeData() {
    try {
        await mysqlDb.authenticate();
        await sqliteDb.authenticate();
        console.log('Connected to both databases.');

        // 1. Merge Registrations
        const [sqliteRegs] = await sqliteDb.query('SELECT * FROM registrations');
        for (const reg of sqliteRegs) {
            // Check if exists in MySQL
            const [existingMysql] = await mysqlDb.query('SELECT id FROM registrations WHERE email = ?', {
                replacements: [reg.email]
            });
            
            if (existingMysql.length === 0) {
                console.log(`Inserting missing registration: ${reg.email}`);
                await mysqlDb.query(
                    `INSERT INTO registrations (full_name, email, phone, country_code, profession, ai_experience, learning_goals, referral_source, status, confirmation_sent, created_at, updated_at, transaction_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    {
                        replacements: [
                            reg.full_name, reg.email, reg.phone, reg.country_code, 
                            reg.profession, reg.ai_experience, reg.learning_goals || '', 
                            reg.referral_source || '', reg.status, reg.confirmation_sent || 0, 
                            reg.created_at || new Date(), reg.updated_at || new Date(),
                            reg.transaction_id || 'N/A'
                        ]
                    }
                );
            }
        }

        // 2. Merge Contact Messages
        const [sqliteMsgs] = await sqliteDb.query('SELECT * FROM contact_messages');
        for (const msg of sqliteMsgs) {
            const [existingMsg] = await mysqlDb.query('SELECT id FROM contact_messages WHERE email = ? AND message = ?', {
                replacements: [msg.email, msg.message]
            });

            if (existingMsg.length === 0) {
                console.log(`Inserting missing contact message from: ${msg.email}`);
                await mysqlDb.query(
                    `INSERT INTO contact_messages (name, email, subject, message, is_read, is_archived, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    {
                        replacements: [
                            msg.name, msg.email, msg.subject, msg.message, 
                            msg.is_read || 0, msg.is_archived || 0,
                            msg.created_at || new Date()
                        ]
                    }
                );
            }
        }

        console.log('Merge complete!');
        process.exit(0);

    } catch (err) {
        console.error('Merge failed:', err);
        process.exit(1);
    }
}

mergeData();

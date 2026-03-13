const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = require('./config/db');

const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'viewer'), defaultValue: 'admin' },
}, { tableName: 'admins', timestamps: true, underscored: true });

(async () => {
    try {
        await sequelize.authenticate();
        let second = await Admin.findOne({ where: { email: 'moderator@mindset.com' } });
        if (!second) {
            const hash = await bcrypt.hash('Admin123', 12);
            second = await Admin.create({
                username: 'mindset_moderator',
                email: 'moderator@mindset.com',
                password_hash: hash,
                role: 'moderator'
            });
            console.log('Created moderator@mindset.com');
        } else {
            console.log('moderator@mindset.com already exists');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

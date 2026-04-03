const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const GalleryPhoto = sequelize.define('GalleryPhoto', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    filename: { type: DataTypes.STRING(255), allowNull: false },
    original_name: { type: DataTypes.STRING(255), allowNull: true },
    caption: { type: DataTypes.STRING(500), allowNull: true },
    url: { type: DataTypes.STRING(500), allowNull: false },
}, {
    tableName: 'gallery_photos',
    timestamps: true,
})

module.exports = GalleryPhoto

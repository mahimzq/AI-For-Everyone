const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const MarketingCampaign = sequelize.define('MarketingCampaign', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subject: { type: DataTypes.STRING(500), allowNull: false },
    html_body: { type: DataTypes.TEXT('long'), allowNull: false },
    target_audience: { type: DataTypes.STRING(50), allowNull: false },
    specific_email: { type: DataTypes.STRING(255), allowNull: true },
    has_image: { type: DataTypes.BOOLEAN, defaultValue: false },
    total_sent: { type: DataTypes.INTEGER, defaultValue: 0 },
    sent_by: { type: DataTypes.STRING(255), allowNull: true },
}, {
    tableName: 'marketing_campaigns',
})

module.exports = MarketingCampaign

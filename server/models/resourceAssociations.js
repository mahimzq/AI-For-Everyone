const Resource = require('./Resource')
const ResourceDownload = require('./ResourceDownload')

if (!Resource.associations.downloads) {
    Resource.hasMany(ResourceDownload, { foreignKey: 'resource_id', as: 'downloads' })
}

if (!ResourceDownload.associations.resource) {
    ResourceDownload.belongsTo(Resource, { foreignKey: 'resource_id', as: 'resource' })
}

module.exports = { Resource, ResourceDownload }

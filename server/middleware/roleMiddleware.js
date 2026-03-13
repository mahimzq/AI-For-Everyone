/**
 * Role-based access control middleware
 * Roles hierarchy: super_admin > admin > moderator > viewer
 */

// Require specific roles
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.admin || !req.admin.role) {
            return res.status(403).json({ message: 'Access denied' })
        }
        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({ message: 'You do not have permission for this action' })
        }
        next()
    }
}

// Shorthand: require admin or super_admin (blocks moderator/viewer)
const requireAdmin = requireRole('super_admin', 'admin')

// Shorthand: require super_admin only
const requireSuperAdmin = requireRole('super_admin')

module.exports = { requireRole, requireAdmin, requireSuperAdmin }

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
exports.requireSuperAdmin = requireSuperAdmin;
var client_1 = require("@prisma/client");
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }
    if (req.user.role !== client_1.UserRole.ADMIN && req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        return res.status(403).json({
            error: 'Admin access required',
            message: 'You do not have permission to access this resource'
        });
    }
    next();
}
function requireSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== client_1.UserRole.SUPER_ADMIN) {
        return res.status(403).json({
            error: 'Super admin access required'
        });
    }
    next();
}

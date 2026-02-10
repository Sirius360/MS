// ===== server/middleware/roleMiddleware.js =====

/**
 * Middleware to check if user has admin role
 * Must be used after authenticate middleware
 */
export function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    next();
}

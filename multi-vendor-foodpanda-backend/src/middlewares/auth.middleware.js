"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { verifyToken } = require('../utils/jwt');
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const decoded = verifyToken(token);
        // Attach user id to request
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map
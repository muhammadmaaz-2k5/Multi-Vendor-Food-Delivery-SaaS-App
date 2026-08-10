"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const generateToken = (userId) => {
    return jwt.sign({ userId }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map
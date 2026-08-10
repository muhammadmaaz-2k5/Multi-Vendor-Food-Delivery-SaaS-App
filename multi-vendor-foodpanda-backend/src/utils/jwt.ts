const jwt = require('jsonwebtoken');

const { env } = require('../config/env');


const generateToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};
exports.generateToken = generateToken;


const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};
exports.verifyToken = verifyToken;


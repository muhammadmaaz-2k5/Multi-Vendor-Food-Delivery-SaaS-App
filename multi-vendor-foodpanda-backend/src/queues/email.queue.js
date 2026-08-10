"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Queue } = require('bullmq');
const { redis } = require('../config/redis');
const emailQueue = new Queue('EmailQueue', {
    connection: redis,
});
emailQueue.on('error', (err) => {
    console.error('EmailQueue Redis Error:', err.message);
});
exports.emailQueue = emailQueue;
const sendWelcomeEmailJob = async (email, firstName) => {
    await emailQueue.add('sendWelcomeEmail', { email, firstName });
};
exports.sendWelcomeEmailJob = sendWelcomeEmailJob;
//# sourceMappingURL=email.queue.js.map
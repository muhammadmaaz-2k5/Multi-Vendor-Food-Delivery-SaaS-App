const { Queue } = require('bullmq');

const { redis } = require('../config/redis');


const emailQueue = new Queue('EmailQueue', {
  connection: redis,
});
emailQueue.on('error', (err: any) => {
  console.error('EmailQueue Redis Error:', err.message);
});
exports.emailQueue = emailQueue;


const sendWelcomeEmailJob = async (email: string, firstName: string) => {
  await emailQueue.add('sendWelcomeEmail', { email, firstName });
};
exports.sendWelcomeEmailJob = sendWelcomeEmailJob;


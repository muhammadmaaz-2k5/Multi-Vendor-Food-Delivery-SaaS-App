import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const emailQueue = new Queue('EmailQueue', {
  connection: redis,
});

export const sendWelcomeEmailJob = async (email: string, firstName: string) => {
  await emailQueue.add('sendWelcomeEmail', { email, firstName });
};

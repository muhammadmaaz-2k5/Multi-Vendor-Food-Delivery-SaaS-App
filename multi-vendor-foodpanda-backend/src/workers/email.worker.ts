import type { Job } from 'bullmq';
const { Worker } = require('bullmq');

const { redis } = require('../config/redis');


const emailWorker = new Worker(
  'EmailQueue',
  async (job: Job) => {
    switch (job.name) {
      case 'sendWelcomeEmail': {
        const { email, firstName } = job.data;
        console.log(`📧 [Mock] Sending Welcome Email to ${firstName} at ${email}...`);
        // Actual email sending (e.g. Resend, SendGrid) will be implemented here later
        break;
      }
      default:
        console.warn(`Unknown job name: ${job.name}`);
    }
  },
  { connection: redis }
);
exports.emailWorker = emailWorker;


emailWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} has failed with ${err.message}`);
});

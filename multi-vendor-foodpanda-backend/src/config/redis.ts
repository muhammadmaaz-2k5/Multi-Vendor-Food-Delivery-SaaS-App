const { Redis } = require('ioredis');

const { env } = require('./env');


const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
redis.on('error', (err) => {
  console.error('Redis connection error (Ensure Redis is running):', err.message);
});
exports.redis = redis;

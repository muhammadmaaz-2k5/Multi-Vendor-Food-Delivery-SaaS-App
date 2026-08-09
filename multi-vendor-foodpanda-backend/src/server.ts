import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import './workers/index.js'; // Initialize workers

import { createServer } from 'http';
import { initSocket } from './lib/socket.js';

const startServer = async () => {
  try {
    // Explicitly connect to check if the DB is reachable at startup
    await prisma.$connect();
    console.log('📦 Connected to Neon Database successfully!');

    const server = createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database', error);
    process.exit(1);
  }
};

startServer();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./config/prisma');
require('./workers/index'); // Initialize workers
const { createServer } = require('http');
const { initSocket } = require('./lib/socket');
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
    }
    catch (error) {
        console.error('❌ Failed to connect to database', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map
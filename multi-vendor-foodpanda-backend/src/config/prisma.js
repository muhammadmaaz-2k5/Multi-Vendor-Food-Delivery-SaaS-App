"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
exports.prisma = prisma;
//# sourceMappingURL=prisma.js.map
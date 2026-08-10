"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { prisma } = require('../config/prisma');
class AuditService {
    static async log(params) {
        try {
            await prisma.auditLog.create({
                data: {
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    userId: params.userId,
                    ipAddress: params.ipAddress,
                    details: params.details ? JSON.parse(JSON.stringify(params.details)) : null,
                }
            });
        }
        catch (error) {
            console.error('AuditLog failed:', error);
            // We don't throw, we don't want audit failures to break main business logic
        }
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.js.map
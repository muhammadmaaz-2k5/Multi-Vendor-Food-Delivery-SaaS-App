import { prisma } from '../config/prisma.js';

export class AuditService {
  static async log(params: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    ipAddress?: string;
    details?: any;
  }) {
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
    } catch (error) {
      console.error('AuditLog failed:', error);
      // We don't throw, we don't want audit failures to break main business logic
    }
  }
}

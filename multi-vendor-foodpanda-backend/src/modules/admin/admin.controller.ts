import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    const totalRestaurants = await prisma.tenant.count();
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
        platformCommission: true
      },
      where: {
        status: { in: ['DELIVERED', 'READY', 'OUT_FOR_DELIVERY', 'PREPARING', 'PAID'] } 
      }
    });

    const totalRevenue = revenueAgg._sum.totalAmount || 0;
    const totalCommissions = revenueAgg._sum.platformCommission || 0;

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalUsers,
        totalOrders,
        totalRevenue,
        totalCommissions
      }
    });
  } catch (error: any) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
};

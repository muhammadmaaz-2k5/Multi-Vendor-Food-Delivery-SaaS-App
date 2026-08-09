import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';

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

    // Time-series data: Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await prisma.order.findMany({
      where: { 
        status: 'DELIVERED',
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, totalAmount: true }
    });

    const revenueByDay: Record<string, { date: string, gmv: number, commission: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDay[dateStr] = { date: dateStr, gmv: 0, commission: 0 };
    }

    recentOrders.forEach(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (revenueByDay[dateStr]) {
        revenueByDay[dateStr].gmv += order.totalAmount;
        revenueByDay[dateStr].commission += (order.totalAmount * 0.10); // Approximation if dynamic rates aren't fetched here
      }
    });
    
    const revenueTrend = Object.values(revenueByDay);

    // Top Restaurants
    const topRestaurantsRaw = await prisma.tenant.findMany({
      take: 5,
      include: {
        _count: {
          select: { orders: { where: { status: 'DELIVERED' } } }
        }
      },
      orderBy: {
        orders: {
          _count: 'desc'
        }
      }
    });

    const topRestaurants = topRestaurantsRaw.map(t => ({
      id: t.id,
      name: t.name,
      orders: t._count.orders,
      rating: t.rating
    }));

    // Top Riders (Fleet Performance)
    const topRidersRaw = await prisma.rider.findMany({
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true } },
        orders: {
          where: { status: 'DELIVERED', riderAssignedAt: { not: null }, deliveredAt: { not: null } },
          select: { riderAssignedAt: true, deliveredAt: true }
        },
        _count: {
          select: { orders: { where: { status: 'DELIVERED' } } }
        }
      },
      orderBy: {
        orders: {
          _count: 'desc'
        }
      }
    });

    const topRiders = topRidersRaw.map(r => {
      // Calculate average delivery time in minutes
      let totalMinutes = 0;
      r.orders.forEach(o => {
        if (o.deliveredAt && o.riderAssignedAt) {
          totalMinutes += (new Date(o.deliveredAt).getTime() - new Date(o.riderAssignedAt).getTime()) / 60000;
        }
      });
      const avgDeliveryTime = r.orders.length > 0 ? Math.round(totalMinutes / r.orders.length) : 0;

      return {
        id: r.id,
        name: `${r.user.firstName} ${r.user.lastName}`,
        deliveries: r._count.orders,
        averageRating: r.averageRating,
        avgDeliveryTime
      };
    });

    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalUsers,
        totalOrders,
        totalRevenue,
        totalCommissions,
        revenueTrend,
        topRestaurants,
        topRiders
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

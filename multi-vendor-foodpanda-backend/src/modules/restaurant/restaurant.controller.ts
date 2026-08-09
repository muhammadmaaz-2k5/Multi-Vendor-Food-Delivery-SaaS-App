import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';
import { AuditService } from '../../lib/audit.js';

export const registerRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, description } = req.body;

    // Ensure the RESTAURANT_OWNER role exists globally
    let ownerRole = await prisma.role.findFirst({
      where: { name: 'RESTAURANT_OWNER', tenantId: null },
    });

    if (!ownerRole) {
      ownerRole = await prisma.role.create({
        data: {
          name: 'RESTAURANT_OWNER',
          description: 'Owner of a restaurant (tenant)',
        },
      });
    }

    // Create the Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        description,
        isActive: true,
      },
    });

    // Assign the user as the owner of this tenant
    await prisma.userRole.create({
      data: {
        userId,
        roleId: ownerRole.id,
        tenantId: tenant.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        tenant,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRestaurants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    
    // Find all UserRoles for this user, include the tenant
    const userRoles = await prisma.userRole.findMany({
      where: { userId, tenantId: { not: null } },
      include: { tenant: true, role: true },
    });

    const restaurants = userRoles.map(ur => ({
      ...ur.tenant,
      role: ur.role.name,
    }));

    res.status(200).json({
      success: true,
      data: {
        restaurants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { deliveryRadiusKm, lat, lng } = req.body;
    const userId = (req as any).user.id;

    const updateData = {
      ...(deliveryRadiusKm !== undefined && { deliveryRadiusKm }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    // Audit Log (QB-706)
    AuditService.log({
      action: 'UPDATE_SETTINGS',
      entity: 'Tenant',
      entityId: id,
      userId,
      ipAddress: req.ip || (req.socket.remoteAddress as string),
      details: updateData
    });

    res.status(200).json({
      success: true,
      data: updatedTenant
    });
  } catch (error) {
    next(error);
  }
};

export const getWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tenantId } = req.params;

    const earningsAgg = await prisma.order.aggregate({
      _sum: {
        tenantEarnings: true
      },
      where: {
        tenantId,
        status: { in: ['DELIVERED', 'READY', 'OUT_FOR_DELIVERY', 'PREPARING', 'PAID'] }
      }
    });

    const recentOrders = await prisma.order.findMany({
      where: { tenantId, status: { in: ['DELIVERED', 'READY', 'OUT_FOR_DELIVERY', 'PREPARING', 'PAID'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        customerName: true,
        tenantEarnings: true,
        status: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: earningsAgg._sum.tenantEarnings || 0,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tenantId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

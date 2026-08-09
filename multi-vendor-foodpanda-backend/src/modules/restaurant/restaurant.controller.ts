import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';

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

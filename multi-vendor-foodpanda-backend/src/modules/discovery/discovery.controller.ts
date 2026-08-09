import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma.js';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, cuisine } = req.query;

    const whereClause: any = {
      isActive: true,
      verificationStatus: 'APPROVED',
    };

    if (search) {
      whereClause.name = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    if (cuisine) {
      whereClause.cuisine = {
        has: String(cuisine),
      };
    }

    const restaurants = await prisma.tenant.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        coverImage: true,
        cuisine: true,
        rating: true,
        deliveryTime: true,
      },
      orderBy: {
        rating: 'desc', 
      }
    });

    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.tenant.findFirst({
      where: {
        id,
        isActive: true,
        verificationStatus: 'APPROVED',
      },
      include: {
        menuCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isActive: true },
              include: {
                modifierGroups: {
                  include: {
                    options: {
                      where: { isAvailable: true },
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

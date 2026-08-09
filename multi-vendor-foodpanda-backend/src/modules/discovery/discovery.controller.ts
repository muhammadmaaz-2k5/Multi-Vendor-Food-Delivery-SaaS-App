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

// ─── AI Recommendation Engine (QB-804) ──────────────────────────────────────
export const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.query;

    // COLD START: No phone provided → return trending (high-rated, most ordered)
    if (!phone) {
      const trending = await prisma.tenant.findMany({
        where: { isActive: true, verificationStatus: 'APPROVED' },
        select: {
          id: true, name: true, description: true, logo: true,
          coverImage: true, cuisine: true, rating: true, deliveryTime: true,
          _count: { select: { orders: { where: { status: 'DELIVERED' } } } }
        },
        orderBy: [{ rating: 'desc' }],
        take: 8,
      });

      const sorted = trending.sort((a, b) => b._count.orders - a._count.orders);
      res.status(200).json({ success: true, type: 'trending', data: sorted });
      return;
    }

    // PERSONALIZED: Build Taste Profile from past orders
    const pastOrders = await prisma.order.findMany({
      where: { customerPhone: String(phone), status: 'DELIVERED' },
      include: {
        tenant: {
          select: { id: true, cuisine: true }
        }
      }
    });

    if (pastOrders.length === 0) {
      // No order history yet → fallback to trending
      const trending = await prisma.tenant.findMany({
        where: { isActive: true, verificationStatus: 'APPROVED' },
        select: {
          id: true, name: true, description: true, logo: true,
          coverImage: true, cuisine: true, rating: true, deliveryTime: true,
        },
        orderBy: { rating: 'desc' },
        take: 8,
      });
      res.status(200).json({ success: true, type: 'trending', data: trending });
      return;
    }

    // Build taste profile: count cuisine preferences
    const cuisineScores: Record<string, number> = {};
    const orderedRestaurantIds = new Set<string>();

    pastOrders.forEach(order => {
      orderedRestaurantIds.add(order.tenantId);
      order.tenant.cuisine.forEach(tag => {
        cuisineScores[tag] = (cuisineScores[tag] || 0) + 1;
      });
    });

    // Get top 3 preferred cuisine tags
    const topCuisines = Object.entries(cuisineScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Find restaurants matching taste profile, preferring ones not yet visited
    const allCandidates = await prisma.tenant.findMany({
      where: {
        isActive: true,
        verificationStatus: 'APPROVED',
        cuisine: { hasSome: topCuisines },
      },
      select: {
        id: true, name: true, description: true, logo: true,
        coverImage: true, cuisine: true, rating: true, deliveryTime: true,
      },
      orderBy: { rating: 'desc' },
      take: 12,
    });

    // Score candidates: unvisited restaurants rank higher
    const scored = allCandidates.map(r => ({
      ...r,
      score: (orderedRestaurantIds.has(r.id) ? 0 : 10) + r.rating,
    })).sort((a, b) => b.score - a.score).slice(0, 8);

    res.status(200).json({
      success: true,
      type: 'personalized',
      tasteProfile: topCuisines,
      data: scored,
    });
  } catch (error) {
    next(error);
  }
};

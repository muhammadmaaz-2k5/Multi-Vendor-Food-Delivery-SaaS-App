import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// MVP Hack: Auto-create or fetch a Dummy Rider for mobile app testing
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    let rider = await prisma.rider.findFirst({
      include: { user: true }
    });

    if (!rider) {
      // Create a dummy user and rider if none exists
      const dummyUser = await prisma.user.create({
        data: {
          email: 'rider@quickbite.com',
          passwordHash: 'dummyhash',
          firstName: 'Speedy',
          lastName: 'Delivery',
          phone: '+1234567890'
        }
      });

      rider = await prisma.rider.create({
        data: {
          userId: dummyUser.id,
          isOnline: false
        },
        include: { user: true }
      });
    }

    res.json(rider);
  } catch (error: any) {
    console.error('Error fetching rider profile:', error);
    res.status(500).json({ error: error.message });
  }
};

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isOnline, lat, lng } = req.body;

    const rider = await prisma.rider.update({
      where: { id },
      data: { 
        isOnline,
        ...(lat && { currentLat: lat }),
        ...(lng && { currentLng: lng })
      },
      include: { user: true }
    });

    res.json(rider);
  } catch (error: any) {
    console.error('Error toggling rider status:', error);
    res.status(500).json({ error: error.message });
  }
};

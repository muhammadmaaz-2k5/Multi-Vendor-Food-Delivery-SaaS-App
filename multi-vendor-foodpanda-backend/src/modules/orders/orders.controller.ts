import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get orders by phone number (pseudo-auth for guest checkout)
export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const orders = await prisma.order.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: { name: true, logo: true }
        },
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

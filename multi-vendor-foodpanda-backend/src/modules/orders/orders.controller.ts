import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { getIO } from '../../lib/socket.js';
import { NotificationService } from '../../lib/notifications.js';

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

// Get active orders for a tenant's KDS
export const getTenantOrders = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    const orders = await prisma.order.findMany({
      where: { 
        tenantId,
        status: { in: ['PAID', 'PREPARING', 'READY'] } // Exclude PENDING_PAYMENT, DELIVERED, CANCELLED
      },
      orderBy: { createdAt: 'asc' },
      include: {
        items: true,
        statusHistory: true
      }
    });

    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching KDS orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update order status (used by KDS)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. PREPARING, READY

    const updateData: any = { status };
    
    if (status === 'OUT_FOR_DELIVERY') {
      updateData.riderAssignedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { 
        items: {
          include: {
            menuItem: {
              include: { recipeIngredients: true }
            }
          }
        }, 
        statusHistory: true 
      }
    });

    const newHistory = await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        notes: `Status changed to ${status} via KDS`
      }
    });
    
    updatedOrder.statusHistory.push(newHistory);

    // [QB-505] Ingredient-based Inventory Deduction
    if (status === 'PREPARING') {
      try {
        for (const item of updatedOrder.items) {
          if (item.menuItem && item.menuItem.recipeIngredients) {
            for (const recipeIngredient of item.menuItem.recipeIngredients) {
              const totalNeeded = recipeIngredient.quantityRequired * item.quantity;
              
              const updatedIng = await prisma.ingredient.update({
                where: { id: recipeIngredient.ingredientId },
                data: { currentStock: { decrement: totalNeeded } }
              });

              // Low Stock Warning
              if (updatedIng.currentStock < updatedIng.lowStockThreshold) {
                console.warn(`[INVENTORY ALERT] 🚨 ${updatedIng.name} is running low for tenant ${updatedIng.tenantId}! Current Stock: ${updatedIng.currentStock} ${updatedIng.unit}`);
                
                // Trigger Notification Service
                NotificationService.sendTenantNotification(
                  updatedIng.tenantId,
                  `Low Stock Alert: ${updatedIng.name}`,
                  `You are running low on ${updatedIng.name}. Current stock is ${updatedIng.currentStock} ${updatedIng.unit}, which is below your threshold of ${updatedIng.lowStockThreshold} ${updatedIng.unit}.`
                );
              }
            }
          }
        }
      } catch (invErr) {
        console.error('Inventory deduction failed:', invErr);
        // We log the error but don't block the order from progressing
      }
    }

    // [QB-602] Automatic Order Assignment Logic
    if (status === 'READY') {
      // Find the first available online rider
      const availableRider = await prisma.rider.findFirst({
        where: { isOnline: true }
      });

      if (availableRider) {
        // Assign the order to this rider
        const assignedOrder = await prisma.order.update({
          where: { id },
          data: { riderId: availableRider.id },
          include: { items: true, statusHistory: true, tenant: true }
        });

        console.log(`[ASSIGNMENT] Order ${id} assigned to Rider ${availableRider.id}`);

        // Emit assignment event to the rider's specific room
        getIO().to(`rider_${availableRider.id}`).emit('order.assigned', assignedOrder);
        
        // Let the customer know a rider was assigned (via the general update)
        getIO().to(`order_${id}`).emit('order.updated', assignedOrder);
        getIO().to(`tenant_${assignedOrder.tenantId}`).emit('order.updated', assignedOrder);

        NotificationService.sendCustomerNotification(
          assignedOrder.customerPhone,
          'Rider Assigned',
          `Great news! A rider has been assigned and is heading to the restaurant to pick up your order.`
        );

        return res.json(assignedOrder);
      } else {
        console.warn(`[ASSIGNMENT] No online riders available for Order ${id}`);
        // We will just let the order sit as READY for now. 
        // In a real app, this would trigger a retry queue or delay.
      }
    }

    // Broadcast to KDS and any listening customers
    getIO().to(`tenant_${updatedOrder.tenantId}`).emit('order.updated', updatedOrder);
    
    // We could also emit to a customer-specific room if we want live customer tracking
    getIO().to(`order_${id}`).emit('order.updated', updatedOrder);

    // Trigger Notification Service for Customer
    NotificationService.sendCustomerNotification(
      updatedOrder.customerPhone,
      `Order Update: ${status}`,
      `Your order #${updatedOrder.id.slice(0,6).toUpperCase()} is now ${status.replace('_', ' ')}!`
    );

    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { code, subtotal, tenantId } = req.body;
    
    if (!code || !subtotal) {
      return res.status(400).json({ error: 'Code and subtotal required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }

    if (coupon.tenantId && coupon.tenantId !== tenantId) {
      return res.status(400).json({ error: 'This coupon is not valid for this restaurant' });
    }

    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order value of $${coupon.minOrderValue} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return res.json({
      success: true,
      data: {
        discountAmount,
        couponId: coupon.id,
        code: coupon.code
      }
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { rating, comment, customerName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { review: true }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'DELIVERED') return res.status(400).json({ error: 'Order must be delivered to leave a review' });
    if (order.review) return res.status(400).json({ error: 'Review already exists for this order' });

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        customerName: customerName || order.customerName,
        orderId: id,
        tenantId: order.tenantId
      }
    });

    // Recalculate tenant average rating
    const aggregations = await prisma.review.aggregate({
      where: { tenantId: order.tenantId },
      _avg: { rating: true }
    });

    if (aggregations._avg.rating) {
      await prisma.tenant.update({
        where: { id: order.tenantId },
        data: { rating: aggregations._avg.rating }
      });
    }

    return res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({ error: error.message });
  }
};

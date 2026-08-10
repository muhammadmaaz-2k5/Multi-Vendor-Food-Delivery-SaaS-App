import type { Request, Response, NextFunction } from 'express';
const { prisma } = require('../../config/prisma');


const checkTenantAccess = async (userId: string, tenantId: string) => {
  const userRole = await prisma.userRole.findFirst({
    where: { userId, tenantId },
  });
  if (!userRole) {
    throw new Error('Forbidden: You do not have access to this restaurant');
  }
};

const createModifierGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const itemId = req.params.itemId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId);

    // Verify item belongs to this tenant
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, tenantId },
    });
    
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu Item not found' });
      return;
    }

    const { name, isRequired, minSelection, maxSelection, options } = req.body;

    const dataToCreate: any = {
      name,
      isRequired,
      minSelection,
      maxSelection,
      menuItemId: itemId,
    };

    if (options && options.length > 0) {
      dataToCreate.options = { create: options };
    }

    const modifierGroup = await prisma.modifierGroup.create({
      data: dataToCreate,
      include: {
        options: true
      }
    });

    res.status(201).json({ success: true, data: modifierGroup });
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.createModifierGroup = createModifierGroup;


const deleteModifierGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const groupId = req.params.groupId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId);

    // Ensure group belongs to tenant (via item)
    const group = await prisma.modifierGroup.findFirst({
      where: { id: groupId, menuItem: { tenantId } },
    });

    if (!group) {
      res.status(404).json({ success: false, message: 'Modifier Group not found' });
      return;
    }

    await prisma.modifierGroup.delete({
      where: { id: groupId }
    });

    res.status(200).json({ success: true, message: 'Modifier Group deleted successfully' });
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.deleteModifierGroup = deleteModifierGroup;


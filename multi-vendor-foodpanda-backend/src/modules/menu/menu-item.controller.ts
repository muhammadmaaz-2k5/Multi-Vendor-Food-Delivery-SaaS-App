import type { Request, Response, NextFunction } from 'express';
const { prisma } = require('../../config/prisma');

const { uploadImageToCloudinary } = require('../../utils/cloudinary');


// Helper to check access
const checkTenantAccess = async (userId: string, tenantId: string) => {
  const userRole = await prisma.userRole.findFirst({
    where: { userId, tenantId },
  });
  if (!userRole) {
    throw new Error('Forbidden: You do not have access to this restaurant');
  }
};

const createMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const categoryId = req.params.categoryId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId);

    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, tenantId },
    });
    
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const { name, description, price, isActive, isAvailable } = req.body;
    let imageUrl = null;

    if (req.file) {
      try {
        imageUrl = await uploadImageToCloudinary(req.file, `tenants/${tenantId}/items`);
      } catch (err: any) {
        console.error('Cloudinary Upload Failed (Will continue without image):', err.message);
      }
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        isActive,
        isAvailable,
        image: imageUrl,
        tenantId,
        menuCategoryId: categoryId,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.createMenuItem = createMenuItem;


const getMenuItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const categoryId = req.params.categoryId as string;
    
    const items = await prisma.menuItem.findMany({
      where: { tenantId, menuCategoryId: categoryId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
exports.getMenuItems = getMenuItems;


const updateMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const itemId = req.params.itemId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId);

    const dataToUpdate = { ...req.body };

    if (req.file) {
      try {
        const imageUrl = await uploadImageToCloudinary(req.file, `tenants/${tenantId}/items`);
        dataToUpdate.image = imageUrl;
      } catch (err: any) {
        console.error('Cloudinary Upload Failed:', err.message);
      }
    }

    const item = await prisma.menuItem.updateMany({
      where: { id: itemId, tenantId },
      data: dataToUpdate,
    });

    if (item.count === 0) {
      res.status(404).json({ success: false, message: 'Menu Item not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Menu Item updated successfully' });
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.updateMenuItem = updateMenuItem;


const deleteMenuItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const itemId = req.params.itemId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId);

    const item = await prisma.menuItem.deleteMany({
      where: { id: itemId, tenantId },
    });

    if (item.count === 0) {
      res.status(404).json({ success: false, message: 'Menu Item not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Menu Item deleted successfully' });
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.deleteMenuItem = deleteMenuItem;


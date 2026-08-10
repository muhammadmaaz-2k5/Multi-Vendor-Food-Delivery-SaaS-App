import type { Request, Response, NextFunction } from 'express';
const { prisma } = require('../../config/prisma');


// Helper to check if user has access to this tenant
const checkTenantAccess = async (userId: string, tenantId: string) => {
  const userRole = await prisma.userRole.findFirst({
    where: { userId, tenantId },
  });
  if (!userRole) {
    throw new Error('Forbidden: You do not have access to this restaurant');
  }
};

const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId!);

    const { name, description, sortOrder, isActive } = req.body;

    const category = await prisma.menuCategory.create({
      data: {
        name,
        description,
        sortOrder,
        isActive,
        tenantId: tenantId!,
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.createCategory = createCategory;


const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    
    const categories = await prisma.menuCategory.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' }
    });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
exports.getCategories = getCategories;


const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const categoryId = req.params.categoryId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId!);

    const category = await prisma.menuCategory.updateMany({
      where: { id: categoryId, tenantId },
      data: req.body,
    });

    if (category.count === 0) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.updateCategory = updateCategory;


const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.params.tenantId as string;
    const categoryId = req.params.categoryId as string;
    const userId = (req as any).user.id;
    
    await checkTenantAccess(userId, tenantId!);

    const category = await prisma.menuCategory.deleteMany({
      where: { id: categoryId, tenantId },
    });

    if (category.count === 0) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
exports.deleteCategory = deleteCategory;


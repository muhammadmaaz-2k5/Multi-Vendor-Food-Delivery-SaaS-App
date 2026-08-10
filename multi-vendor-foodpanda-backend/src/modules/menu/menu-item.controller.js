"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { prisma } = require('../../config/prisma');
const { uploadImageToCloudinary } = require('../../utils/cloudinary');
// Helper to check access
const checkTenantAccess = async (userId, tenantId) => {
    const userRole = await prisma.userRole.findFirst({
        where: { userId, tenantId },
    });
    if (!userRole) {
        throw new Error('Forbidden: You do not have access to this restaurant');
    }
};
const createMenuItem = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const categoryId = req.params.categoryId;
        const userId = req.user.id;
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
            }
            catch (err) {
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
    }
    catch (error) {
        if (error.message && error.message.includes('Forbidden')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.createMenuItem = createMenuItem;
const getMenuItems = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const categoryId = req.params.categoryId;
        const items = await prisma.menuItem.findMany({
            where: { tenantId, menuCategoryId: categoryId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
};
exports.getMenuItems = getMenuItems;
const updateMenuItem = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const itemId = req.params.itemId;
        const userId = req.user.id;
        await checkTenantAccess(userId, tenantId);
        const dataToUpdate = { ...req.body };
        if (req.file) {
            try {
                const imageUrl = await uploadImageToCloudinary(req.file, `tenants/${tenantId}/items`);
                dataToUpdate.image = imageUrl;
            }
            catch (err) {
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
    }
    catch (error) {
        if (error.message && error.message.includes('Forbidden')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.updateMenuItem = updateMenuItem;
const deleteMenuItem = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const itemId = req.params.itemId;
        const userId = req.user.id;
        await checkTenantAccess(userId, tenantId);
        const item = await prisma.menuItem.deleteMany({
            where: { id: itemId, tenantId },
        });
        if (item.count === 0) {
            res.status(404).json({ success: false, message: 'Menu Item not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Menu Item deleted successfully' });
    }
    catch (error) {
        if (error.message && error.message.includes('Forbidden')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.deleteMenuItem = deleteMenuItem;
//# sourceMappingURL=menu-item.controller.js.map
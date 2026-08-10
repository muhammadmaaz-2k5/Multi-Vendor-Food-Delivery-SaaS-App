"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { prisma } = require('../../config/prisma');
const checkTenantAccess = async (userId, tenantId) => {
    const userRole = await prisma.userRole.findFirst({
        where: { userId, tenantId },
    });
    if (!userRole) {
        throw new Error('Forbidden: You do not have access to this restaurant');
    }
};
const createModifierGroup = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const itemId = req.params.itemId;
        const userId = req.user.id;
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
        const dataToCreate = {
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
    }
    catch (error) {
        if (error.message && error.message.includes('Forbidden')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.createModifierGroup = createModifierGroup;
const deleteModifierGroup = async (req, res, next) => {
    try {
        const tenantId = req.params.tenantId;
        const groupId = req.params.groupId;
        const userId = req.user.id;
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
    }
    catch (error) {
        if (error.message && error.message.includes('Forbidden')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.deleteModifierGroup = deleteModifierGroup;
//# sourceMappingURL=modifier.controller.js.map
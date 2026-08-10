"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { prisma } = require('../../config/prisma');
// MVP Hack: Auto-create or fetch a Dummy Rider for mobile app testing
const getMyProfile = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching rider profile:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.getMyProfile = getMyProfile;
const toggleStatus = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error toggling rider status:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.toggleStatus = toggleStatus;
//# sourceMappingURL=riders.controller.js.map
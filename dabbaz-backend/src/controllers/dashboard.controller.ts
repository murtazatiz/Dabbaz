import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const getCustomerDashboard = async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        const todayStart = startOfDay(new Date());

        // Fetch user's subscriptions and their upcoming orders
        const subscriptions = await prisma.subscription.findMany({
            where: { user_id: user.id },
            include: {
                plan: true,
                vendor: { select: { business_name: true, slug: true } },
                Order: {
                    where: { delivery_date: { gte: todayStart } },
                    orderBy: { delivery_date: 'asc' },
                    select: { delivery_date: true, status: true, meal_type: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ subscriptions });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVendorDashboard = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        // Stats
        const activeSubscribers = await prisma.subscription.count({
            where: { vendor_id: vendorProfile.id, status: 'ACTIVE' }
        });

        // Mock today's deliveries since we aren't running a daily cron to generate "Order" records yet
        // In a real system, a CRON job creates Order records every morning for active subs that don't have an off_day
        const mockDeliveriesCount = await prisma.subscription.count({
            where: { vendor_id: vendorProfile.id, status: 'ACTIVE' }
        });

        // Fetch today's actual order records
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const todayOrders = await prisma.order.findMany({
            where: {
                vendor_id: vendorProfile.id,
                delivery_date: { gte: todayStart, lte: todayEnd }
            },
            include: { user: { select: { name: true, phone: true } }, subscription: { select: { delivery_notes: true } } },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            stats: {
                activeSubscribers,
                todaysDeliveries: mockDeliveriesCount,
                pendingLeaves: 0, // Mock
                nextPayout: activeSubscribers * 500 // Mock calc
            },
            todayOrders: todayOrders
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const pauseSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resume_date } = req.body;

        await prisma.subscription.update({
            where: { id: Number(id) },
            data: { status: 'PAUSED', resume_date: new Date(resume_date) }
        });

        res.json({ message: 'Paused' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

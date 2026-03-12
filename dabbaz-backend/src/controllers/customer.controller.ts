import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, format, isBefore, setHours, setMinutes, subDays, parseISO, addDays } from 'date-fns';

const prisma = new PrismaClient();

const formatOrderSlot = async (order: any, now: Date) => {
    // 9:00 PM cutoff of the previous day
    const previousDay = subDays(order.delivery_date, 1);
    const cutoffTime = setMinutes(setHours(previousDay, 21), 0);
    const cancellationAllowed = isBefore(now, cutoffTime) &&
        ['CONFIRMED', 'PREPARING', 'BEING_PREPARED'].includes(order.status);

    const menuItem = await prisma.menuItem.findUnique({
        where: {
            vendor_id_date_meal_type: {
                vendor_id: order.vendor_id,
                date: startOfDay(order.delivery_date),
                meal_type: order.meal_type
            }
        }
    });

    const mealName = menuItem?.name || "Chef's Special";
    const isDelivery = order.fulfillment_mode === 'DELIVERY';
    const statusMap: Record<string, string> = {
        'PREPARING': 'BEING_PREPARED',
        'NOT_DELIVERED': 'CANCELLED',
        'NOT_COLLECTED': 'CANCELLED'
    };

    return {
        slotType: order.meal_type,
        orderId: order.id,
        vendorId: order.vendor_id,
        vendorName: order.vendor.business_name,
        mealName: mealName,
        portions: order.quantity,
        addons: [],
        fulfilmentType: order.fulfillment_mode,
        deliveryAddress: isDelivery ? "12A, Sea View Apartments, Carter Road, Bandra West" : null,
        deliveryWindow: isDelivery ? (order.meal_type === 'LUNCH' ? `${order.vendor.lunch_window_start} – ${order.vendor.lunch_window_end}` : `${order.vendor.dinner_window_start} – ${order.vendor.dinner_window_end}`) : null,
        collectionAddress: !isDelivery ? (order.meal_type === 'LUNCH' ? order.vendor.collection_address_lunch : order.vendor.collection_address_dinner) : null,
        collectionWindow: !isDelivery ? (order.meal_type === 'LUNCH' ? `${order.vendor.collection_lunch_window_start} – ${order.vendor.collection_lunch_window_end}` : `${order.vendor.collection_dinner_window_start} – ${order.vendor.collection_dinner_window_end}`) : null,
        status: statusMap[order.status] || order.status,
        orderValue: 100 * order.quantity + Number(order.delivery_charge),
        cancellationAllowed
    };
};

export const getDashboardToday = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const now = new Date();
        const start = startOfDay(now);
        const end = endOfDay(now);

        const orders = await prisma.order.findMany({
            where: { user_id: userId, delivery_date: { gte: start, lte: end } },
            include: { vendor: true },
            orderBy: { meal_type: 'desc' } // LUNCH before DINNER lexicographically
        });

        const slots = await Promise.all(orders.map(o => formatOrderSlot(o, now)));

        res.json({ date: format(now, 'yyyy-MM-dd'), hasOrders: slots.length > 0, slots });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDashboardTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const daysCount = parseInt(req.query.days as string) || 7;
        const now = new Date();
        const startDate = startOfDay(now);
        const endDate = endOfDay(addDays(now, daysCount - 1));

        const orders = await prisma.order.findMany({
            where: { user_id: userId, delivery_date: { gte: startDate, lte: endDate } },
            select: { delivery_date: true }
        });

        const orderCountsByDate: Record<string, number> = {};
        orders.forEach(o => {
            const dateStr = format(o.delivery_date, 'yyyy-MM-dd');
            orderCountsByDate[dateStr] = (orderCountsByDate[dateStr] || 0) + 1;
        });

        const days = Array.from({ length: daysCount }).map((_, i) => {
            const currentDay = addDays(now, i);
            const dateStr = format(currentDay, 'yyyy-MM-dd');
            const count = orderCountsByDate[dateStr] || 0;
            return {
                date: dateStr,
                hasOrders: count > 0,
                orderCount: count
            };
        });

        res.json({ days });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDashboardDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const dateStr = req.query.date as string;
        if (!dateStr) {
            res.status(400).json({ message: 'Missing date parameter' });
            return;
        }

        const targetDate = parseISO(dateStr);
        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        const orders = await prisma.order.findMany({
            where: { user_id: userId, delivery_date: { gte: start, lte: end } },
            include: { vendor: true },
            orderBy: { meal_type: 'desc' }
        });

        const slots = await Promise.all(orders.map(o => formatOrderSlot(o, new Date())));

        res.json({ date: dateStr, hasOrders: slots.length > 0, slots });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDashboardAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const now = new Date();
        const twoDaysAgo = subDays(now, 2);

        const dbAlerts = await prisma.notification.findMany({
            where: { user_id: userId, created_at: { gte: twoDaysAgo } },
            orderBy: { created_at: 'desc' }
        });

        const alertsList = dbAlerts.map(a => ({
            id: `db-${a.id}`,
            type: a.type,
            message: a.body,
            createdAt: a.created_at
        }));

        const tomorrowStart = startOfDay(addDays(now, 1));
        const tomorrowEnd = endOfDay(addDays(now, 1));

        const tomorrowOrders = await prisma.order.findMany({
            where: { user_id: userId, delivery_date: { gte: tomorrowStart, lte: tomorrowEnd }, status: { in: ['CONFIRMED', 'PREPARING'] } },
            include: { vendor: { select: { business_name: true } } }
        });

        tomorrowOrders.forEach(o => {
            alertsList.unshift({
                id: `computed-reminder-${o.id}`,
                type: 'UPCOMING_REMINDER',
                message: `You have a ${o.meal_type === 'LUNCH' ? 'Lunch' : 'Dinner'} delivery tomorrow from ${o.vendor.business_name}`,
                createdAt: null as any
            });
        });

        res.json({ alerts: alertsList });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDashboardPastOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const startOfToday = startOfDay(new Date());

        const totalCount = await prisma.order.count({
            where: { user_id: userId, delivery_date: { lt: startOfToday } }
        });

        const orders = await prisma.order.findMany({
            where: { user_id: userId, delivery_date: { lt: startOfToday } },
            include: { vendor: true },
            orderBy: { delivery_date: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        });

        const formattedOrders = await Promise.all(orders.map(async o => {
            const menuItem = await prisma.menuItem.findUnique({
                where: { vendor_id_date_meal_type: { vendor_id: o.vendor_id, date: startOfDay(o.delivery_date), meal_type: o.meal_type } }
            });
            return {
                orderId: o.id,
                vendorId: o.vendor_id,
                vendorName: o.vendor.business_name,
                vendorCoverPhoto: o.vendor.cover_photo_url,
                date: format(o.delivery_date, 'yyyy-MM-dd'),
                slotType: o.meal_type,
                mealName: menuItem?.name || "Chef's Special",
                portions: o.quantity,
                orderValue: 100 * o.quantity + Number(o.delivery_charge),
                status: (o.status === 'NOT_DELIVERED' || o.status === 'NOT_COLLECTED') ? 'CANCELLED' : o.status
            };
        }));

        res.json({ page, totalPages: Math.ceil(totalCount / limit), orders: formattedOrders });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFavourites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const favs = await prisma.customerFavouriteVendor.findMany({
            where: { customerId: userId },
            include: { vendor: true }
        });
        res.json({
            favourites: favs.map((f: any) => ({
                vendorId: f.vendorId,
                vendorName: f.vendor.business_name,
                coverPhoto: f.vendor.cover_photo_url,
                cuisineType: f.vendor.cuisine_tags ? JSON.parse(f.vendor.cuisine_tags).join(', ') : 'Mixed',
                foodType: f.vendor.food_type
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addFavourite = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const vendorId = parseInt(req.params.vendorId as string, 10);
        await prisma.customerFavouriteVendor.create({
            data: { customerId: userId, vendorId }
        });
        res.json({ message: 'Added' });
    } catch (error: any) {
        if (error.code === 'P2002') res.status(409).json({ message: 'Already favourited' });
        else res.status(500).json({ error: error.message });
    }
};

export const removeFavourite = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const vendorId = parseInt(req.params.vendorId as string, 10);
        await prisma.customerFavouriteVendor.deleteMany({
            where: { customerId: userId, vendorId }
        });
        res.json({ message: 'Removed' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.json({ balance: Number(user?.wallet_balance) || 0 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

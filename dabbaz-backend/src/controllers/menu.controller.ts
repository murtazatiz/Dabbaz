import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';

export const getMenu = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const weekStr = req.query.week as string; // 'YYYY-MM-DD' representing Monday
        let startDate = new Date();
        if (weekStr) {
            startDate = parseISO(weekStr);
        } else {
            startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        }

        // Add 7 days to get the end of the week
        const endDate = addDays(startDate, 7);

        const items = await prisma.menuItem.findMany({
            where: {
                vendor_id: vendorProfile.id,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
        });

        res.json({ items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const { date, meal_type, name, description, food_type } = req.body;

        const item = await prisma.menuItem.create({
            data: {
                vendor_id: vendorProfile.id,
                date: parseISO(date),
                meal_type,
                name,
                description,
                food_type,
            },
        });

        res.json({ item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, food_type } = req.body;

        const item = await prisma.menuItem.update({
            where: { id: Number(id) },
            data: { name, description, food_type },
        });

        res.json({ item });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({ where: { id: Number(id) } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleOffDay = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({ where: { id: Number(id) } });
        if (!item) return res.status(404).json({ message: "Not found" });

        // Update both lunch and dinner for this date
        await prisma.menuItem.updateMany({
            where: { vendor_id: item.vendor_id, date: item.date },
            data: { is_off_day: !item.is_off_day }
        });

        res.json({ message: 'Day off toggled' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const toggleSlotDisable = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({ where: { id: Number(id) } });
        if (!item) return res.status(404).json({ message: "Not found" });

        await prisma.menuItem.update({
            where: { id: Number(id) },
            data: { is_slot_disabled: !item.is_slot_disabled }
        });

        res.json({ message: 'Slot toggled' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

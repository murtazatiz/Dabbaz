import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfWeek, endOfWeek, addDays, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export const getMenu = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const monthStr = req.query.month as string;
        const weekStr = req.query.week as string;
        let startDate = new Date();
        let endDate = new Date();

        if (monthStr) {
            startDate = startOfMonth(parseISO(monthStr + '-01'));
            endDate = endOfMonth(startDate);
        } else if (weekStr) {
            startDate = parseISO(weekStr);
            endDate = addDays(startDate, 7);
        } else {
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(startDate);
        }

        const items = await prisma.menuItem.findMany({
            where: {
                vendor_id: vendorProfile.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                MenuItemAddon: {
                    include: {
                        addon: true
                    }
                }
            }
        });

        res.json({ items });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const {
            date, meal_type, name, description, food_type,
            fulfilment_types, max_orders, max_portions
        } = req.body;

        const item = await prisma.menuItem.create({
            data: {
                vendor_id: vendorProfile.id,
                date: parseISO(date),
                meal_type,
                name,
                description,
                food_type,
                fulfilment_types: fulfilment_types || 'DELIVERY',
                max_orders: max_orders ? Number(max_orders) : null,
                max_portions: max_portions ? Number(max_portions) : null,
            },
        });

        res.json({ item });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name, description, food_type,
            fulfilment_types, max_orders, max_portions
        } = req.body;

        const item = await prisma.menuItem.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                food_type,
                fulfilment_types,
                max_orders: max_orders !== undefined ? (max_orders ? Number(max_orders) : null) : undefined,
                max_portions: max_portions !== undefined ? (max_portions ? Number(max_portions) : null) : undefined,
            },
        });

        res.json({ item });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({ where: { id: Number(id) } });
        res.json({ message: 'Deleted' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
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
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
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
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const toggleStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({ where: { id: Number(id) } });
        if (!item) return res.status(404).json({ message: "Not found" });

        const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

        const updated = await prisma.menuItem.update({
            where: { id: Number(id) },
            data: { status: newStatus }
        });

        res.json({ item: updated });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const getMenuItemAddons = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const addons = await prisma.menuItemAddon.findMany({
            where: { menu_item_id: Number(id) },
            include: { addon: true }
        });
        res.json({ addons });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const attachMenuItemAddons = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { addons } = req.body; // array of { addonId, price }

        await prisma.menuItemAddon.deleteMany({
            where: { menu_item_id: Number(id) }
        });

        if (addons && addons.length > 0) {
            await prisma.menuItemAddon.createMany({
                data: addons.map((a: any) => ({
                    menu_item_id: Number(id),
                    addon_id: Number(a.addonId),
                    price: Number(a.price)
                }))
            });
        }

        const updatedAddons = await prisma.menuItemAddon.findMany({
            where: { menu_item_id: Number(id) },
            include: { addon: true }
        });

        res.json({ addons: updatedAddons });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const updateMenuItemAddon = async (req: Request, res: Response) => {
    try {
        const { id, addonId } = req.params;
        const { price } = req.body;

        const updated = await prisma.menuItemAddon.update({
            where: {
                menu_item_id_addon_id: {
                    menu_item_id: Number(id),
                    addon_id: Number(addonId)
                }
            },
            data: { price: Number(price) }
        });

        res.json({ addon: updated });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

export const detachMenuItemAddon = async (req: Request, res: Response) => {
    try {
        const { id, addonId } = req.params;

        await prisma.menuItemAddon.delete({
            where: {
                menu_item_id_addon_id: {
                    menu_item_id: Number(id),
                    addon_id: Number(addonId)
                }
            }
        });

        res.json({ message: 'Detached' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, stack: error.stack });
    }
};

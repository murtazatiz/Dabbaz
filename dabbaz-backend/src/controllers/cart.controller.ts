import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addDays } from 'date-fns';

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.query.session_id as string;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or session ID required' });
        }

        const whereClause = userId ? { user_id: userId } : { session_id: sessionId };

        const items = await prisma.cartItem.findMany({
            where: whereClause,
            include: {
                vendor: { select: { business_name: true, delivery_charge: true, collection_enabled: true } },
                menu_item: { select: { name: true, food_type: true, max_orders: true, max_portions: true, current_orders: true, current_portions: true } }
            }
        });

        res.json({ items });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.body.session_id;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or session ID required' });
        }

        const { vendor_id, menu_item_id, meal_type, delivery_date, quantity, fulfillment_mode } = req.body;
        const qty = quantity ? Number(quantity) : 1;

        // Verify MenuItem existence and capacity
        const menuItem = await prisma.menuItem.findUnique({ where: { id: Number(menu_item_id) } });
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

        if (menuItem.max_orders && menuItem.current_orders >= menuItem.max_orders) {
            return res.status(400).json({ message: 'Item is at maximum order capacity' });
        }

        if (menuItem.max_portions && (menuItem.current_portions + qty) > menuItem.max_portions) {
            return res.status(400).json({ message: 'Item is at maximum portion capacity' });
        }

        // Add to cart
        const cartItem = await prisma.cartItem.create({
            data: {
                user_id: userId || null,
                session_id: userId ? null : sessionId,
                vendor_id: Number(vendor_id),
                menu_item_id: Number(menu_item_id),
                meal_type,
                delivery_date: new Date(delivery_date),
                addons: "[]",
                quantity: qty,
                fulfillment_mode: fulfillment_mode || 'DELIVERY',
                expires_at: addDays(new Date(), 7)
            }
        });

        // Reserve Capacity
        await prisma.menuItem.update({
            where: { id: menuItem.id },
            data: {
                current_orders: { increment: 1 },
                current_portions: { increment: qty }
            }
        });

        res.status(201).json({ item: cartItem });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const cartItemId = Number(req.params.id);

        const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

        await prisma.cartItem.delete({ where: { id: cartItemId } });

        // Release Capacity
        await prisma.menuItem.update({
            where: { id: cartItem.menu_item_id },
            data: {
                current_orders: { decrement: 1 },
                current_portions: { decrement: cartItem.quantity }
            }
        });

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateVendorFulfillmentMode = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.body.session_id;

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User ID or session ID required' });
        }

        const { vendor_id, fulfillment_mode } = req.body;
        const whereClause = userId ? { user_id: userId } : { session_id: sessionId };

        const updatedCount = await prisma.cartItem.updateMany({
            where: {
                ...whereClause,
                vendor_id: Number(vendor_id)
            },
            data: {
                fulfillment_mode
            }
        });

        res.json({ message: `Updated fulfillment mode for ${updatedCount.count} items`, updatedCount });
    } catch (error) {
        console.error('Error updating fulfillment mode:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

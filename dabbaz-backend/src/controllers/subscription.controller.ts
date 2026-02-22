import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getPlans = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const plans = await prisma.subscriptionPlan.findMany({
            where: { vendor_id: vendorProfile.id }
        });

        res.json({ plans });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPlan = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { user_id: user.id } });
        if (!vendorProfile) return res.status(404).json({ message: 'Vendor not found' });

        const { name, duration_days, meal_type, food_type, price, description, auto_renewal_default } = req.body;

        if (duration_days < 4) {
            return res.status(400).json({ message: 'Duration must be at least 4 days' });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                vendor_id: vendorProfile.id,
                name,
                duration_days,
                meal_type,
                food_type,
                price,
                description: description || '',
                auto_renewal_default
            }
        });

        res.json({ plan });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, duration_days, meal_type, food_type, price, description, auto_renewal_default } = req.body;

        const plan = await prisma.subscriptionPlan.update({
            where: { id: Number(id) },
            data: { name, duration_days, meal_type, food_type, price, description, auto_renewal_default }
        });

        res.json({ plan });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const togglePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: Number(id) } });

        if (!plan) return res.status(404).json({ message: 'Not found' });

        await prisma.subscriptionPlan.update({
            where: { id: Number(id) },
            data: { is_active: !plan.is_active }
        });

        res.json({ message: 'Plan toggled' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const activeSubs = await prisma.subscription.count({
            where: { plan_id: Number(id), status: 'ACTIVE' }
        });

        if (activeSubs > 0) {
            return res.status(400).json({ message: 'Cannot delete plan with active subscribers. Please pause it instead.' });
        }

        await prisma.subscriptionPlan.delete({ where: { id: Number(id) } });

        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

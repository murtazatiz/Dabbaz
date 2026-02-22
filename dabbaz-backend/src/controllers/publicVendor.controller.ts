import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { parseISO, addDays, startOfWeek } from 'date-fns';

export const listVendors = async (req: Request, res: Response) => {
    try {
        const { search, food_type, pincode } = req.query;

        const where: any = {
            is_active: true,
        };

        if (search) {
            where.OR = [
                { business_name: { contains: search as string } },
                { cuisine_tags: { contains: search as string } }
            ];
        }

        if (food_type && food_type !== 'ALL') {
            where.food_type = food_type;
        }

        if (pincode) {
            where.delivery_pincodes = { contains: pincode as string };
        }

        const vendors = await prisma.vendorProfile.findMany({
            where,
            select: {
                id: true,
                slug: true,
                business_name: true,
                cover_photo_url: true,
                is_verified: true,
                cuisine_tags: true,
                food_type: true,
                delivery_pincodes: true,
                daily_capacity: true,
                active_subscriber_count: true,
            }
        });

        res.json({ vendors });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVendorPublicProfile = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const slugStr = typeof slug === 'string' ? slug : slug[0];
        const vendor = await prisma.vendorProfile.findUnique({
            where: { slug: slugStr, is_active: true }
        });

        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.json({ vendor });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVendorMenu = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { week } = req.query;

        const slugStr = typeof slug === 'string' ? slug : slug[0];

        const vendor = await prisma.vendorProfile.findUnique({
            where: { slug: slugStr }
        });

        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        let startDate = new Date();
        if (week) {
            startDate = parseISO(week as string);
        } else {
            startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        }
        const endDate = addDays(startDate, 7);

        const items = await prisma.menuItem.findMany({
            where: {
                vendor_id: vendor.id,
                date: {
                    gte: startDate,
                    lt: endDate,
                },
            },
        });

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVendorPlans = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const slugStr = typeof slug === 'string' ? slug : slug[0];
        const vendor = await prisma.vendorProfile.findUnique({
            where: { slug: slugStr }
        });

        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                vendor_id: vendor.id,
                is_active: true
            }
        });

        res.json({ plans });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

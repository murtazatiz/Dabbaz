import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const activeVendors = await prisma.vendorProfile.count({ where: { is_active: true } });
        const pendingApplications = await prisma.vendorOnboardingRequest.count({ where: { status: 'PENDING' } });
        const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });

        res.json({ totalUsers, activeVendors, pendingApplications, activeSubscriptions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

export const getVendorQueue = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.vendorOnboardingRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'desc' }
        });
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching queue' });
    }
};

export const approveVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const request = await prisma.vendorOnboardingRequest.findUnique({ where: { id: Number(id) } });

        if (!request) return res.status(404).json({ message: 'Not found' });

        await prisma.$transaction(async (tx) => {
            // 1. Update request status
            await tx.vendorOnboardingRequest.update({
                where: { id: Number(id) },
                data: { status: 'APPROVED' },
            });

            // 2. Update user role
            await tx.user.update({
                where: { id: request.user_id },
                data: { role: 'VENDOR' }
            });

            // 3. Create VendorProfile
            await tx.vendorProfile.create({
                data: {
                    user_id: request.user_id,
                    business_name: request.business_name,
                    slug: request.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                    about: request.sample_menu_text || 'Welcome to our kitchen!',
                    fssai_number: 'N/A', // In reality you'd prompt for this or extract from docs
                    fssai_doc_url: request.fssai_doc_url,
                    govt_id_url: request.govt_id_url,
                    cuisine_tags: '[]',
                    food_type: 'BOTH',
                    delivery_pincodes: JSON.stringify([request.pincode]), // Initial pincode
                    cover_photo_url: '',
                    photo_urls: '[]',
                    daily_capacity: request.daily_capacity,
                    bank_account_name: 'Pending',
                    bank_account_number: 'Pending',
                    bank_ifsc: 'Pending'
                }
            });
        });

        // Mock send email
        console.log(`[Email Mock] Sent approval email to user ${request.user_id}`);

        res.json({ message: 'Vendor approved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error approving vendor' });
    }
};

export const rejectVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        const request = await prisma.vendorOnboardingRequest.update({
            where: { id: Number(id) },
            data: { status: 'REJECTED', rejection_reason },
        });

        console.log(`[Email Mock] Sent rejection email to user ${request.user_id}: ${rejection_reason}`);

        res.json({ message: 'Vendor rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting vendor' });
    }
};

export const requestVendorInfo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.vendorOnboardingRequest.update({
            where: { id: Number(id) },
            data: { status: 'NEEDS_MORE_INFO' },
        });

        res.json({ message: 'Information requested' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting vendor' });
    }
};

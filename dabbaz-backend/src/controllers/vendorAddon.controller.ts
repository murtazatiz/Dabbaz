import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Helper to get vendor_id
const getVendorId = async (userId: number) => {
    const profile = await prisma.vendorProfile.findUnique({ where: { user_id: userId } });
    return profile?.id;
};

export const getAddons = async (req: Request, res: Response) => {
    try {
        const vendorId = await getVendorId(req.user!.id);
        if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });

        const addons = await prisma.vendorAddon.findMany({
            where: { vendor_id: vendorId },
            orderBy: { created_at: 'desc' }
        });
        res.json({ addons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createAddon = async (req: Request, res: Response) => {
    try {
        const vendorId = await getVendorId(req.user!.id);
        if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });

        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const existing = await prisma.vendorAddon.findFirst({
            where: { vendor_id: vendorId, name }
        });
        if (existing) return res.status(400).json({ message: 'Addon with this name already exists' });

        const addon = await prisma.vendorAddon.create({
            data: {
                vendor_id: vendorId,
                name
            }
        });
        res.status(201).json({ addon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateAddon = async (req: Request, res: Response) => {
    try {
        const vendorId = await getVendorId(req.user!.id);
        if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });

        const addonId = Number(req.params.id);
        const { name } = req.body;

        const addon = await prisma.vendorAddon.findUnique({ where: { id: addonId } });
        if (!addon || addon.vendor_id !== vendorId) {
            return res.status(404).json({ message: 'Addon not found' });
        }

        const existing = await prisma.vendorAddon.findFirst({
            where: { vendor_id: vendorId, name, id: { not: addonId } }
        });
        if (existing) return res.status(400).json({ message: 'Addon with this name already exists' });

        const updated = await prisma.vendorAddon.update({
            where: { id: addonId },
            data: { name }
        });
        res.json({ addon: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAddon = async (req: Request, res: Response) => {
    try {
        const vendorId = await getVendorId(req.user!.id);
        if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });

        const addonId = Number(req.params.id);

        const addon = await prisma.vendorAddon.findUnique({ where: { id: addonId } });
        if (!addon || addon.vendor_id !== vendorId) {
            return res.status(404).json({ message: 'Addon not found' });
        }

        // Check if in use
        const inUseCount = await prisma.menuItemAddon.count({
            where: { addon_id: addonId }
        });

        if (inUseCount > 0) {
            return res.status(400).json({
                message: 'This addon is currently in use on one or more meal slots and cannot be deleted. Please remove it from all meal slots first.'
            });
        }

        await prisma.vendorAddon.delete({ where: { id: addonId } });
        res.json({ message: 'Addon deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

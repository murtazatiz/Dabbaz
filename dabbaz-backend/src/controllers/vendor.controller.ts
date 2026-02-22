import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const submitOnboardingRequest = async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        if (!user.phone_verified) {
            return res.status(403).json({ message: 'Phone must be verified before onboarding' });
        }

        const {
            business_name,
            contact_name,
            address,
            pincode,
            years_of_operation,
            daily_capacity,
            fssai_doc_url,
            govt_id_url,
            hygiene_cert_url,
            sample_menu_text,
            recaptcha_token
        } = req.body;

        // Simulate reCaptcha token check
        if (!recaptcha_token) {
            // In real life verify token via google api
        }

        // Check for existing pending/approved requests to prevent duplicates
        const existing = await prisma.vendorOnboardingRequest.findFirst({
            where: {
                user_id: user.id,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });

        if (existing) {
            return res.status(409).json({ message: 'You already have a pending or approved application' });
        }

        const application = await prisma.vendorOnboardingRequest.create({
            data: {
                user_id: user.id,
                status: 'PENDING',
                business_name,
                contact_name,
                address,
                pincode,
                years_of_operation: Number(years_of_operation),
                daily_capacity: Number(daily_capacity),
                fssai_doc_url,
                govt_id_url,
                hygiene_cert_url,
                sample_menu_text,
                recaptcha_score: 0.9 // mock score
            }
        });

        return res.status(201).json({ message: 'Application submitted successfully', application });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const profile = await prisma.vendorProfile.findUnique({
            where: { user_id: user.id }
        });

        if (!profile) return res.status(404).json({ message: 'Vendor profile not found' });

        res.json({ profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        const {
            business_name,
            about,
            food_type,
            daily_capacity,
            is_active,
            delivery_pincodes,
            lunch_window_start,
            lunch_window_end,
            dinner_window_start,
            dinner_window_end,
            bank_account_name,
            bank_account_number,
            bank_ifsc,
            delivery_charge,
            collection_enabled,
            collection_address_lunch,
            collection_address_dinner,
            collection_lunch_window_start,
            collection_lunch_window_end,
            collection_dinner_window_start,
            collection_dinner_window_end
        } = req.body;

        const profile = await prisma.vendorProfile.update({
            where: { user_id: user.id },
            data: {
                business_name,
                about,
                food_type,
                daily_capacity: Number(daily_capacity),
                is_active,
                delivery_pincodes, // expects stringified json
                lunch_window_start,
                lunch_window_end,
                dinner_window_start,
                dinner_window_end,
                bank_account_name,
                bank_account_number,
                bank_ifsc,
                delivery_charge: delivery_charge ? Number(delivery_charge) : null,
                collection_enabled: Boolean(collection_enabled),
                collection_address_lunch,
                collection_address_dinner,
                collection_lunch_window_start,
                collection_lunch_window_end,
                collection_dinner_window_start,
                collection_dinner_window_end
            }
        });

        res.json({ message: 'Profile updated', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

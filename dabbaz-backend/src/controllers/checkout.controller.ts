import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addDays, parseISO } from 'date-fns';

export const getPlanMeta = async (req: Request, res: Response) => {
    try {
        const { planId } = req.params;
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: Number(planId) },
            include: {
                vendor: {
                    select: { business_name: true }
                }
            }
        });

        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.json({ plan });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const { plan_id, start_date, delivery_address } = req.body;

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: Number(plan_id) } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const startDateObj = parseISO(start_date);
        const endDateObj = addDays(startDateObj, plan.duration_days);

        // Create a PENDING subscription record
        const subscription = await prisma.subscription.create({
            data: {
                user_id: user.id,
                vendor_id: plan.vendor_id,
                plan_id: plan.id,
                status: 'PENDING_PAYMENT',
                start_date: startDateObj,
                end_date: endDateObj,
                auto_renewal: plan.auto_renewal_default,
                meals_remaining: plan.duration_days,
                delivery_notes: typeof delivery_address === 'string' ? delivery_address : JSON.stringify(delivery_address),
            }
        });

        // NOTE: In a real app we'd call Razorpay Orders API here and return the order_id
        // const razorpayOrder = await razorpay.orders.create({ amount: plan.price * 100, currency: 'INR' ... });

        res.json({ subscription });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { subscription_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Simulate signature verification
        // if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) throw Error...

        const subscription = await prisma.subscription.findUnique({ where: { id: Number(subscription_id) } });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: subscription.plan_id } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        // 1. Update Subscription Status
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'ACTIVE' }
        });

        // 2. Insert Payment Record
        await prisma.payment.create({
            data: {
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                amount: plan.price,
                platform_fee: Number(plan.price) * 0.05, // mock 5%
                vendor_payout: Number(plan.price) * 0.95,
                status: 'SUCCESS',
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: razorpay_payment_id
            }
        });

        // 3. Mark vendor as having +1 active sub
        await prisma.vendorProfile.update({
            where: { id: subscription.vendor_id },
            data: { active_subscriber_count: { increment: 1 } }
        });

        res.json({ message: 'Payment verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

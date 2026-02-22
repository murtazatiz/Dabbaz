import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { addDays } from 'date-fns';

export const createOrderFromCart = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const { platform_fee_total } = req.body; // Sent from frontend

        // 1. Fetch Cart Items
        const cartItems = await prisma.cartItem.findMany({
            where: { user_id: user.id },
            include: {
                vendor: true,
                menu_item: true
            }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // 2. Validate Cart Rules (Minimum 3 portions per vendor)
        const vendorPortions: Record<number, number> = {};
        cartItems.forEach(item => {
            vendorPortions[item.vendor_id] = (vendorPortions[item.vendor_id] || 0) + item.quantity;
        });

        for (const [vendorId, totalPortions] of Object.entries(vendorPortions)) {
            if (totalPortions < 3) {
                return res.status(400).json({
                    message: `Minimum 3 portions required per vendor. Vendor ID ${vendorId} only has ${totalPortions} portions.`
                });
            }
        }

        // 3. Calculate Item Total and Delivery Charges
        let itemsTotal = 0;
        let totalDeliveryCharge = 0;

        // Group by vendor and delivery date + meal type to determine unique delivery occurrences
        const deliveryOccurrences = new Set<string>();

        for (const item of cartItems) {
            itemsTotal += 100 * item.quantity; // MOCK: Assuming each item is standard ₹100 for now. Real life: Add price to MenuItem schema or logic

            if (item.fulfillment_mode === 'DELIVERY') {
                const occurrenceKey = `${item.vendor_id}-${item.delivery_date.toISOString().split('T')[0]}-${item.meal_type}`;
                if (!deliveryOccurrences.has(occurrenceKey)) {
                    deliveryOccurrences.add(occurrenceKey);
                    totalDeliveryCharge += Number(item.vendor.delivery_charge || 0);
                }
            }
        }

        // 4. Create mock order value for Razorpay (Items + Delivery + Platform)
        // In real app, calculate GST as well.
        const GST_FOOD = itemsTotal * 0.03; // 3% on food
        const GST_DELIVERY = totalDeliveryCharge * 0.18; // 18% on delivery

        const finalAmount = itemsTotal + totalDeliveryCharge + Number(platform_fee_total) + GST_FOOD + GST_DELIVERY;

        // Create a parent 'mock' Razorpay Order ID to tie the transaction
        const mockRazorpayOrderId = `order_${Date.now()}_${user.id}`;

        // Return the required information to the frontend to initiate Razorpay
        res.json({
            success: true,
            razorpayOrderId: mockRazorpayOrderId,
            amount: finalAmount,
            currency: 'INR',
            summary: {
                itemsTotal,
                totalDeliveryCharge,
                gst: GST_FOOD + GST_DELIVERY,
                platformFee: platform_fee_total,
                finalAmount
            }
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyOrderPayment = async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Simulate signature verification
        if (!razorpay_payment_id || !razorpay_order_id) {
            return res.status(400).json({ message: 'Invalid payment payload' });
        }

        // Fetch Cart
        const cartItems = await prisma.cartItem.findMany({
            where: { user_id: user.id },
            include: { vendor: true, menu_item: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or already processed' });
        }

        let totalAmount = 0;
        let totalPlatformFee = 0;
        let totalVendorPayout = 0;

        // 1. Convert Cart Items to Order records
        // We do this in a loop because each cart item is essentially one 'Order' line item in DB structure
        const ordersCreated = [];

        for (const item of cartItems) {

            // Mock price derivation 
            const itemPrice = 100; // Mock standard price
            const itemDeliveryCharge = item.fulfillment_mode === 'DELIVERY' ? Number(item.vendor.delivery_charge || 0) : 0;

            totalAmount += (itemPrice * item.quantity);

            const order = await prisma.order.create({
                data: {
                    user_id: user.id,
                    vendor_id: item.vendor_id,
                    delivery_date: item.delivery_date,
                    meal_type: item.meal_type,
                    status: item.fulfillment_mode === 'DELIVERY' ? 'PREPARING' : 'READY_FOR_COLLECTION',
                    quantity: item.quantity,
                    fulfillment_mode: item.fulfillment_mode,
                    delivery_charge: itemDeliveryCharge
                }
            });
            ordersCreated.push(order);

            // Increment active subscriber metric (mock logic to show vendor popularity)
            await prisma.vendorProfile.update({
                where: { id: item.vendor_id },
                data: { active_subscriber_count: { increment: 1 } }
            });
        }

        // Calculate mock fees 
        totalPlatformFee = totalAmount * 0.05;
        totalVendorPayout = totalAmount * 0.95;

        // 2. Insert Payment Record
        await prisma.payment.create({
            data: {
                user_id: user.id,
                amount: totalAmount,
                platform_fee: totalPlatformFee,
                vendor_payout: totalVendorPayout,
                status: 'SUCCESS',
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: razorpay_payment_id
            }
        });

        // 3. Clear the Cart
        await prisma.cartItem.deleteMany({
            where: { user_id: user.id }
        });

        res.json({ message: 'Payment verified successfully and orders created', orders: ordersCreated });
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Internal server error verification failed' });
    }
};

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    createOrderFromCart,
    verifyOrderPayment
} from '../controllers/checkout.controller';

const router = Router();

// Used during checkout flow (Phase 2 Cartesian style)
router.post('/create', requireAuth, createOrderFromCart);
router.post('/verify-payment', requireAuth, verifyOrderPayment);

export default router;

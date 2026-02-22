import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getPlanMeta,
    createSubscription,
    verifyPayment
} from '../controllers/checkout.controller';

const router = Router();

// Used during checkout flow
router.get('/plan-meta/:planId', requireAuth, getPlanMeta);
router.post('/create', requireAuth, createSubscription);
router.post('/verify-payment', requireAuth, verifyPayment);

export default router;

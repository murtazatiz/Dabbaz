import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getVendorDashboard,
    pauseSubscription
} from '../controllers/dashboard.controller';

const router = Router();

router.get('/vendors/dashboard', requireAuth, requireRole('VENDOR'), getVendorDashboard);

router.post('/subscriptions/:id/pause', requireAuth, requireRole('CUSTOMER'), pauseSubscription);

export default router;

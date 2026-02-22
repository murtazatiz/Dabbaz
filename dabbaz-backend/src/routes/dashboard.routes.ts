import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getCustomerDashboard,
    getVendorDashboard,
    pauseSubscription
} from '../controllers/dashboard.controller';

const router = Router();

router.get('/customer/dashboard', requireAuth, requireRole('CUSTOMER'), getCustomerDashboard);
router.get('/vendors/dashboard', requireAuth, requireRole('VENDOR'), getVendorDashboard);

router.post('/subscriptions/:id/pause', requireAuth, requireRole('CUSTOMER'), pauseSubscription);

export default router;

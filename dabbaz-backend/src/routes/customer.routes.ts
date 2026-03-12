import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getDashboardToday,
    getDashboardTimeline,
    getDashboardDay,
    getDashboardAlerts,
    getDashboardPastOrders,
    getFavourites,
    addFavourite,
    removeFavourite,
    getWalletBalance
} from '../controllers/customer.controller';

const router = Router();

// Dashboard routes
router.get('/dashboard/today', requireAuth, requireRole('CUSTOMER'), getDashboardToday);
router.get('/dashboard/timeline', requireAuth, requireRole('CUSTOMER'), getDashboardTimeline);
router.get('/dashboard/day', requireAuth, requireRole('CUSTOMER'), getDashboardDay);
router.get('/dashboard/alerts', requireAuth, requireRole('CUSTOMER'), getDashboardAlerts);
router.get('/dashboard/past-orders', requireAuth, requireRole('CUSTOMER'), getDashboardPastOrders);

// Favourites
router.get('/favourites', requireAuth, requireRole('CUSTOMER'), getFavourites);
router.post('/favourites/:vendorId', requireAuth, requireRole('CUSTOMER'), addFavourite);
router.delete('/favourites/:vendorId', requireAuth, requireRole('CUSTOMER'), removeFavourite);

// Wallet
router.get('/wallet/balance', requireAuth, requireRole('CUSTOMER'), getWalletBalance);

export default router;

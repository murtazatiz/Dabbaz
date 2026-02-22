import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getStats,
    getVendorQueue,
    approveVendor,
    rejectVendor,
    requestVendorInfo
} from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/vendor-queue', getVendorQueue);

router.post('/vendor-queue/:id/approve', approveVendor);
router.post('/vendor-queue/:id/reject', rejectVendor);
router.post('/vendor-queue/:id/request-info', requestVendorInfo);

export default router;

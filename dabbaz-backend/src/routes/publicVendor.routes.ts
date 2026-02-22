import { Router } from 'express';
import {
    listVendors,
    getVendorPublicProfile,
    getVendorMenu,
    getVendorPlans
} from '../controllers/publicVendor.controller';

const router = Router();

// Notice: In the guide, routes are under /api/vendors/public for listing/discovery
router.get('/list', listVendors);
router.get('/public/:slug', getVendorPublicProfile);
router.get('/public/:slug/menu', getVendorMenu);
router.get('/public/:slug/plans', getVendorPlans);

export default router;

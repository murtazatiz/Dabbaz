import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { submitOnboardingRequest, getProfile, updateProfile } from '../controllers/vendor.controller';

const router = Router();

router.post('/onboarding-request', requireAuth, submitOnboardingRequest);

router.get('/profile', requireAuth, requireRole('VENDOR'), getProfile);
router.patch('/profile', requireAuth, requireRole('VENDOR'), updateProfile);

export default router;

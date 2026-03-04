import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { getAddons, createAddon, updateAddon, deleteAddon } from '../controllers/vendorAddon.controller';

const router = Router();

router.get('/', requireAuth, requireRole('VENDOR'), getAddons);
router.post('/', requireAuth, requireRole('VENDOR'), createAddon);
router.put('/:id', requireAuth, requireRole('VENDOR'), updateAddon);
router.delete('/:id', requireAuth, requireRole('VENDOR'), deleteAddon);

export default router;

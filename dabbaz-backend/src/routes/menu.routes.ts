import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleOffDay,
    toggleSlotDisable
} from '../controllers/menu.controller';

const router = Router();

// Used by both vendor and customer contexts (customer only needs GET)
router.get('/', getMenu);

// Admin / Vendor specific mutations
router.post('/', requireAuth, requireRole('VENDOR'), createMenuItem);
router.patch('/:id', requireAuth, requireRole('VENDOR'), updateMenuItem);
router.delete('/:id', requireAuth, requireRole('VENDOR'), deleteMenuItem);

router.patch('/:id/off-day', requireAuth, requireRole('VENDOR'), toggleOffDay);
router.patch('/:id/disable-slot', requireAuth, requireRole('VENDOR'), toggleSlotDisable);

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleOffDay,
    toggleSlotDisable,
    toggleStatus,
    getMenuItemAddons,
    attachMenuItemAddons,
    updateMenuItemAddon,
    detachMenuItemAddon
} from '../controllers/menu.controller';

const router = Router();

// Used by vendor context
router.get('/', requireAuth, getMenu);

// Admin / Vendor specific mutations
router.post('/', requireAuth, requireRole('VENDOR'), createMenuItem);
router.patch('/:id', requireAuth, requireRole('VENDOR'), updateMenuItem);
router.delete('/:id', requireAuth, requireRole('VENDOR'), deleteMenuItem);

router.patch('/:id/off-day', requireAuth, requireRole('VENDOR'), toggleOffDay);
router.patch('/:id/disable-slot', requireAuth, requireRole('VENDOR'), toggleSlotDisable);
router.patch('/:id/status', requireAuth, requireRole('VENDOR'), toggleStatus);

// Addons for specific menu item
router.get('/:id/addons', requireAuth, getMenuItemAddons);
router.post('/:id/addons', requireAuth, requireRole('VENDOR'), attachMenuItemAddons);
router.put('/:id/addons/:addonId', requireAuth, requireRole('VENDOR'), updateMenuItemAddon);
router.delete('/:id/addons/:addonId', requireAuth, requireRole('VENDOR'), detachMenuItemAddon);

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
    getPlans,
    createPlan,
    updatePlan,
    togglePlan,
    deletePlan
} from '../controllers/subscription.controller';

const router = Router();

// Notice: In the guide, routes are /api/vendors/plans 
// To make it easy to nest in Express, we will mount it there in app.ts,
// so here the routes are just '/'
router.use(requireAuth);
router.use(requireRole('VENDOR'));

router.get('/', getPlans);
router.post('/', createPlan);
router.patch('/:id', updatePlan);
router.patch('/:id/toggle', togglePlan);
router.delete('/:id', deletePlan);

export default router;

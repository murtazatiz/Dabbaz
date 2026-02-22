import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateVendorFulfillmentMode } from '../controllers/cart.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// We use optionalAuth here because cart can be accessed by unauthenticated users via sessionId
router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.delete('/:id', optionalAuth, removeFromCart);
router.patch('/update-mode', optionalAuth, updateVendorFulfillmentMode);

export default router;

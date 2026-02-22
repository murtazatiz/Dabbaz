import { Router } from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import {
    login,
    register,
    refresh,
    logout,
    sendOtp,
    verifyOtp,
    getMe
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { User } from '@prisma/client';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', requireAuth, getMe);

router.post('/send-otp', requireAuth, sendOtp);
router.post('/verify-otp', requireAuth, verifyOtp);

router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const user = req.user as User;
            const accessToken = generateAccessToken(user.id);
            const refreshToken = await generateRefreshToken(user.id);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/dashboard?access_token=${accessToken}&refresh_token=${refreshToken}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect('/login');
        }
    }
);

export default router;

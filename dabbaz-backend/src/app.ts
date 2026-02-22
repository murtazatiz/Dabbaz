import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from './lib/passport';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

import authRoutes from './routes/auth.routes';
import vendorRoutes from './routes/vendor.routes';
import adminRoutes from './routes/admin.routes';
import menuRoutes from './routes/menu.routes';
import subscriptionRoutes from './routes/subscription.routes';
import publicVendorRoutes from './routes/publicVendor.routes';
import checkoutRoutes from './routes/checkout.routes';
import dashboardRoutes from './routes/dashboard.routes';
import cartRoutes from './routes/cart.routes';

app.use('/api/auth', authRoutes);

// Public vendor discovery mounted here
app.use('/api/vendors', publicVendorRoutes);

// Protected vendor routes
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors/menu', menuRoutes);
app.use('/api/vendors/plans', subscriptionRoutes);

// Checkout & subscriptions
app.use('/api/subscriptions', checkoutRoutes);

// Dashboards (Customer / Vendor)
app.use('/api', dashboardRoutes);

// Cart
app.use('/api/cart', cartRoutes);

// Add health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

export default app;

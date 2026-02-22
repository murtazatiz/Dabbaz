import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/auth.store';
import { CartProvider } from './store/cart.store';
import Layout from './components/Layout';

// Public
import HomePage from './pages/public/HomePage';
import VendorProfilePage from './pages/public/VendorProfilePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Customer
import BecomeVendorPage from './pages/customer/BecomeVendorPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Vendor
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorSettingsPage from './pages/vendor/VendorSettingsPage';
import MenuPage from './pages/vendor/MenuPage';
import PlansPage from './pages/vendor/PlansPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import VendorQueuePage from './pages/admin/VendorQueuePage';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
};

const VendorRoute = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    if (!user || user.role !== 'VENDOR') return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

const AdminRoute = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    if (!user || user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
    return <Outlet />;
};

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            // Public Routes
            { path: '/', element: <HomePage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/signup', element: <SignupPage /> },
            { path: '/chef/:slug', element: <VendorProfilePage /> },

            // Protected Customer Routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/dashboard', element: <CustomerDashboard /> },
                    { path: '/become-a-chef', element: <BecomeVendorPage /> },
                    { path: '/checkout/:planId', element: <CheckoutPage /> },
                ]
            },

            // Vendor Routes
            {
                element: <VendorRoute />,
                children: [
                    { path: '/vendor-dashboard', element: <VendorDashboard /> },
                    { path: '/vendor-settings', element: <VendorSettingsPage /> },
                    { path: '/vendor-menu', element: <MenuPage /> },
                    { path: '/vendor-plans', element: <PlansPage /> },
                ]
            },

            // Admin Routes
            {
                element: <AdminRoute />,
                children: [
                    { path: '/admin-dashboard', element: <AdminDashboardPage /> },
                    { path: '/admin-queue', element: <VendorQueuePage /> },
                ]
            }
        ]
    }
]);

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <RouterProvider router={router} />
            </CartProvider>
        </AuthProvider>
    );
}

export default App;

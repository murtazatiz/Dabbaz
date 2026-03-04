import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.store';
import CartSheet from './common/CartSheet';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 glass-header transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-2xl font-extrabold text-brand-primary tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <span className="bg-brand-primary text-white rounded-lg p-1.5 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),2px_2px_8px_rgba(180,130,90,0.3)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                            </span>
                            Dabbaz
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="text-sm font-medium">Hi, {user.name} ({user.role})</div>

                                {user.role === 'CUSTOMER' && (
                                    <>
                                        <Link to="/become-a-chef" className="text-sm font-medium hover:text-brand-primary">Become a Chef</Link>
                                        <Link to="/dashboard" className="text-sm font-medium hover:text-brand-primary">Dashboard</Link>
                                    </>
                                )}
                                {user.role === 'VENDOR' && (
                                    <Link to="/vendor-dashboard" className="text-sm font-medium hover:text-brand-primary">Chef Dashboard</Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin-dashboard" className="text-sm font-medium hover:text-brand-primary">Admin Area</Link>
                                )}

                                <button onClick={handleLogout} className="text-sm font-medium text-error hover:opacity-80 transition-opacity">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium hover:text-brand-primary transition-colors">Login</Link>
                                <Link to="/signup" className="text-sm btn-skeuo-primary px-5 py-2">Sign Up</Link>
                            </>
                        )}
                        <CartSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}

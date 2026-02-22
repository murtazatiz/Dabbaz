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
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-2xl font-extrabold text-green-600 tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <span className="bg-green-600 text-white rounded-lg p-1.5 shadow-sm">
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
                                        <Link to="/become-a-chef" className="text-sm font-medium hover:text-green-600">Become a Chef</Link>
                                        <Link to="/dashboard" className="text-sm font-medium hover:text-green-600">Dashboard</Link>
                                    </>
                                )}
                                {user.role === 'VENDOR' && (
                                    <Link to="/vendor-dashboard" className="text-sm font-medium hover:text-green-600">Chef Dashboard</Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin-dashboard" className="text-sm font-medium hover:text-green-600">Admin Area</Link>
                                )}

                                <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium hover:text-green-600">Login</Link>
                                <Link to="/signup" className="text-sm font-bold bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700">Sign Up</Link>
                            </>
                        )}
                        <CartSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
}

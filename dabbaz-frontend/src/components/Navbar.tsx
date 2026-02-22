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
        <nav className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-bold text-green-700">Home</Link>
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

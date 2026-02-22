import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../store/auth.store';

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const { login: authenticateUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError('');
        try {
            const response = await api.post('/auth/login', data);
            const { user, access_token, refresh_token } = response.data;

            authenticateUser(user, access_token, refresh_token);

            // Route based on role
            if (user.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (user.role === 'VENDOR') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Failed to login');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to Dabbaz
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                {...register('email')}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                                {...register('password')}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    {serverError && <p className="text-sm text-center text-red-600">{serverError}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.7449 12.27C23.7449 11.48 23.6849 10.73 23.5549 10H12.2549V14.51H18.7249C18.4349 15.99 17.5849 17.24 16.3249 18.09V21.09H20.1849C22.4449 19.01 23.7449 15.92 23.7449 12.27Z" fill="#4285F4" />
                                <path d="M12.255 24C15.495 24 18.205 22.92 20.185 21.09L16.325 18.09C15.245 18.81 13.875 19.25 12.255 19.25C9.12502 19.25 6.47502 17.14 5.52502 14.29H1.54502V17.38C3.51502 21.3 7.56502 24 12.255 24Z" fill="#34A853" />
                                <path d="M5.52498 14.29C5.27498 13.57 5.14498 12.8 5.14498 12C5.14498 11.2 5.28498 10.43 5.52498 9.71V6.62H1.54498C0.724983 8.24 0.254983 10.06 0.254983 12C0.254983 13.94 0.724983 15.76 1.54498 17.38L5.52498 14.29Z" fill="#FBBC05" />
                                <path d="M12.255 4.75C14.025 4.75 15.605 5.36 16.855 6.55L20.275 3.13C18.205 1.19 15.495 0 12.255 0C7.56502 0 3.51502 2.7 1.54502 6.62L5.52498 9.71C6.47502 6.86 9.12502 4.75 12.255 4.75Z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>
                    </div>
                </div>

                <p className="mt-2 text-center text-sm text-gray-600">
                    Not a member?{' '}
                    <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
                        Sign up now
                    </Link>
                </p>

            </div>
        </div>
    );
}

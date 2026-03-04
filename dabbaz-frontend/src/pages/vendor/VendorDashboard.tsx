import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function VendorDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [todayOrders, setTodayOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/vendors/dashboard');
                setStats(res.data.stats);
                setTodayOrders(res.data.todayOrders);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const completeOrder = async (id: number) => {
        try {
            await api.patch(`/vendors/orders/${id}/complete`);
            setTodayOrders(todayOrders.map(o => o.id === id ? { ...o, status: 'DELIVERED' } : o));
        } catch {
            alert("Failed to map order");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!stats) return <div className="max-w-6xl mx-auto py-8 px-4"><p className="text-gray-500">Could not load dashboard data. Are you an approved Chef?</p></div>;

    return (
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Chef Dashboard</h1>
                    <div className="flex gap-4">
                        <Link to="/vendor-menu" className="btn-skeuo-primary px-4 py-2">Manage Menu</Link>
                        <Link to="/vendor-plans" className="btn-skeuo px-4 py-2 hover:bg-white/50">Manage Plans</Link>
                        <Link to="/vendor-settings" className="btn-skeuo px-4 py-2 hover:bg-white/50">Settings</Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="card-neumorphic border-l-4 border-blue-500">
                        <div className="text-sm text-text-secondary font-medium">Active Subscribers</div>
                        <div className="text-2xl font-bold mt-1 text-text-primary">{stats.activeSubscribers}</div>
                    </div>
                    <div className="card-neumorphic border-l-4 border-success">
                        <div className="text-sm text-text-secondary font-medium">Today's Deliveries</div>
                        <div className="text-2xl font-bold mt-1 text-text-primary">{stats.todaysDeliveries}</div>
                    </div>
                    <div className="card-neumorphic border-l-4 border-brand-primary">
                        <div className="text-sm text-text-secondary font-medium">Pending Approvals</div>
                        <div className="text-2xl font-bold mt-1 text-text-primary">{stats.pendingLeaves}</div>
                    </div>
                    <div className="card-neumorphic border-l-4 border-purple-500">
                        <div className="text-sm text-text-secondary font-medium">Next Payout</div>
                        <div className="text-2xl font-bold mt-1 text-text-primary">₹{stats.nextPayout}</div>
                    </div>
                </div>

                {/* Today's Roster */}
                <div className="card-neumorphic overflow-hidden p-0 mb-8">
                    <div className="p-5 border-b border-brand-primary/10 bg-brand-base flex justify-between items-center rounded-t-[20px]">
                        <h2 className="font-extrabold text-xl text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Today's Delivery Roster ({format(new Date(), 'MMM d')})</h2>
                        <button className="btn-skeuo text-sm px-4 py-2 hover:bg-white/50">Print List</button>
                    </div>

                    <table className="min-w-full divide-y divide-brand-primary/10">
                        <thead className="bg-brand-primary/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Address / PIN</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Meal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-primary/10 bg-transparent">
                            {todayOrders.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-text-secondary font-medium">No deliveries scheduled for today!</td></tr>
                            ) : todayOrders.map(order => {
                                const address = order.subscription.delivery_notes || 'No Address Provided';
                                return (
                                    <tr key={order.id} className={order.status === 'DELIVERED' ? 'bg-success/5' : 'hover:bg-brand-primary/5 transition-colors'}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-text-primary">{order.user.name}</div>
                                            <div className="text-xs text-text-secondary font-medium">{order.user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-text-secondary line-clamp-2" title={address}>{address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-text-primary">
                                            {order.meal_type}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-inner inset-shadow-sm border ${order.status === 'PREPARING' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-success/10 text-success border-success/20'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.status !== 'DELIVERED' && (
                                                <button onClick={() => completeOrder(order.id)} className="btn-skeuo text-sm px-4 py-2 hover:bg-success/10 hover:text-success text-brand-primary border border-transparent">
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

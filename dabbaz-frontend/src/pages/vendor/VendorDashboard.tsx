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
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Chef Dashboard</h1>
                <div className="flex gap-4">
                    <Link to="/vendor-menu" className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700">Manage Menu</Link>
                    <Link to="/vendor-plans" className="bg-white border text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-50">Manage Plans</Link>
                    <Link to="/vendor-settings" className="bg-white border text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-50">Settings</Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
                    <div className="text-sm text-gray-500 font-medium">Active Subscribers</div>
                    <div className="text-2xl font-bold mt-1">{stats.activeSubscribers}</div>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-green-500">
                    <div className="text-sm text-gray-500 font-medium">Today's Deliveries</div>
                    <div className="text-2xl font-bold mt-1">{stats.todaysDeliveries}</div>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-orange-500">
                    <div className="text-sm text-gray-500 font-medium">Pending Approvals</div>
                    <div className="text-2xl font-bold mt-1">{stats.pendingLeaves}</div>
                </div>
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-purple-500">
                    <div className="text-sm text-gray-500 font-medium">Next Payout</div>
                    <div className="text-2xl font-bold mt-1">₹{stats.nextPayout}</div>
                </div>
            </div>

            {/* Today's Roster */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-lg">Today's Delivery Roster ({format(new Date(), 'MMM d')})</h2>
                    <button className="text-sm bg-white border px-3 py-1 rounded hover:bg-gray-100 font-medium">Print List</button>
                </div>

                <table className="min-w-full divide-y">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address / PIN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {todayOrders.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No deliveries scheduled for today!</td></tr>
                        ) : todayOrders.map(order => {
                            const address = order.subscription.delivery_notes || 'No Address Provided';
                            return (
                                <tr key={order.id} className={order.status === 'DELIVERED' ? 'bg-green-50/30' : ''}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{order.user.name}</div>
                                        <div className="text-xs text-gray-500">{order.user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm line-clamp-2" title={address}>{address}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {order.meal_type}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded ${order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status !== 'DELIVERED' && (
                                            <button onClick={() => completeOrder(order.id)} className="text-sm text-green-600 border border-green-600 rounded px-3 py-1 hover:bg-green-50 font-medium">
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
    );
}

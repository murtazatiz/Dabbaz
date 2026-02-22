import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function CustomerDashboard() {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/customer/dashboard');
                setSubscriptions(res.data.subscriptions);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handlePause = async (id: number) => {
        const resumeDate = prompt("Enter resume date (YYYY-MM-DD):", format(addDays(new Date(), 2), 'yyyy-MM-dd'));
        if (!resumeDate) return;
        try {
            await api.post(`/subscriptions/${id}/pause`, { resume_date: resumeDate });
            alert("Subscription paused!");
            window.location.reload();
        } catch {
            alert("Failed to pause subscription");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>

            {subscriptions.length === 0 ? (
                <div className="bg-white rounded p-12 text-center text-gray-500 shadow border">
                    You don't have any active meal subscriptions. Browse local chefs to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{sub.plan.name}</h3>
                                    <p className="text-sm text-gray-600">by {sub.vendor.business_name}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    sub.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {sub.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded mb-4">
                                <div className="flex justify-between">
                                    <span>Meals Remaining</span>
                                    <span className="font-medium text-gray-900">{sub.meals_remaining} / {sub.plan.duration_days}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valid Until</span>
                                    <span className="font-medium">{format(new Date(sub.end_date), 'MMM d, yyyy')}</span>
                                </div>
                                {sub.status === 'PAUSED' && sub.resume_date && (
                                    <div className="flex justify-between text-yellow-700">
                                        <span>Resumes On</span>
                                        <span className="font-medium">{format(new Date(sub.resume_date), 'MMM d, yyyy')}</span>
                                    </div>
                                )}
                                {sub.Order && sub.Order.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="font-semibold text-gray-900 mb-2">Upcoming Deliveries:</div>
                                        <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                                            {sub.Order.map((order: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-xs">
                                                    <span>{format(new Date(order.delivery_date), 'EEE, MMM d')}</span>
                                                    <span className="font-medium">{order.meal_type}</span>
                                                    <span className={`px-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>{order.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link to={`/chef/${sub.vendor.slug}`} className="flex-1 text-center bg-green-50 text-green-700 border border-green-200 py-2 font-medium rounded hover:bg-green-100">
                                    View Menu
                                </Link>
                                {sub.status === 'ACTIVE' && (
                                    <button onClick={() => handlePause(sub.id)} className="flex-1 bg-white border py-2 font-medium rounded hover:bg-gray-50">
                                        Pause Deliveries
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

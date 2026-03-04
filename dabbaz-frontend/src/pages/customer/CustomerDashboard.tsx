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
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-extrabold mb-8 text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>My Subscriptions</h1>

                {subscriptions.length === 0 ? (
                    <div className="card-neumorphic p-12 text-center text-text-secondary font-medium">
                        You don't have any active meal subscriptions. Browse local chefs to get started!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.map(sub => (
                            <div key={sub.id} className="card-neumorphic">
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className="font-extrabold text-xl text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{sub.plan.name}</h3>
                                        <p className="text-sm font-medium text-text-secondary mt-1">by {sub.vendor.business_name}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-inner inset-shadow-sm border ${sub.status === 'ACTIVE' ? 'bg-success/10 text-success border-success/20' :
                                        sub.status === 'PAUSED' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                                            'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-text-secondary font-medium bg-brand-primary/5 p-5 rounded-xl mb-6 border border-brand-primary/10">
                                    <div className="flex justify-between items-center">
                                        <span>Meals Remaining</span>
                                        <span className="font-bold text-brand-primary text-base">{sub.meals_remaining} / {sub.plan.duration_days}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-brand-primary/10 pt-3">
                                        <span>Valid Until</span>
                                        <span className="font-bold text-text-primary">{format(new Date(sub.end_date), 'MMM d, yyyy')}</span>
                                    </div>
                                    {sub.status === 'PAUSED' && sub.resume_date && (
                                        <div className="flex justify-between text-brand-secondary border-t border-brand-primary/10 pt-3">
                                            <span>Resumes On</span>
                                            <span className="font-bold">{format(new Date(sub.resume_date), 'MMM d, yyyy')}</span>
                                        </div>
                                    )}
                                    {sub.Order && sub.Order.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-brand-primary/20">
                                            <div className="font-extrabold text-text-primary mb-3">Upcoming Deliveries:</div>
                                            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {sub.Order.map((order: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/50 rounded-lg">
                                                        <span className="font-medium">{format(new Date(order.delivery_date), 'EEE, MMM d')}</span>
                                                        <span className="font-bold text-text-primary">{order.meal_type}</span>
                                                        <span className={`px-2 py-1 rounded-full shadow-inner inset-shadow-sm border ${order.status === 'DELIVERED' ? 'bg-success/10 text-success border-success/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>{order.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Link to={`/chef/${sub.vendor.slug}`} className="btn-skeuo-primary flex-1 text-center py-3 text-sm">
                                        View Menu
                                    </Link>
                                    {sub.status === 'ACTIVE' && (
                                        <button onClick={() => handlePause(sub.id)} className="btn-skeuo flex-1 py-3 text-sm text-text-secondary hover:text-brand-secondary">
                                            Pause Deliveries
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

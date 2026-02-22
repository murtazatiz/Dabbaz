import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, startOfWeek, addDays } from 'date-fns';
import api from '../../lib/api';

export default function VendorProfilePage() {
    const { slug } = useParams();
    const [vendor, setVendor] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Default to showing this week's menu
    const [currentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [activeMenuTab, setActiveMenuTab] = useState<'LUNCH' | 'DINNER'>('LUNCH');

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                const weekStr = format(currentWeek, 'yyyy-MM-dd');
                // Fetch public profile, menu, and plans
                const [profileRes, menuRes, plansRes] = await Promise.all([
                    api.get(`/vendors/public/${slug}`),
                    api.get(`/vendors/public/${slug}/menu?week=${weekStr}`),
                    api.get(`/vendors/public/${slug}/plans`)
                ]);

                setVendor(profileRes.data.vendor);
                setMenu(menuRes.data.items);
                setPlans(plansRes.data.plans);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load vendor profile", error);
                setLoading(false);
            }
        };
        fetchVendorDetails();
    }, [slug, currentWeek]);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Chef Details...</div>;
    if (!vendor) return <div className="p-12 text-center text-red-500">Chef not found</div>;

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Cover Profile Header */}
            <div className="bg-white border-b">
                <div className="h-64 md:h-80 w-full bg-gray-200 relative">
                    {vendor.cover_photo_url && (
                        <img src={vendor.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 md:left-12 text-white">
                        <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-2">
                            {vendor.business_name}
                            {vendor.is_verified && <span className="text-blue-400 text-2xl" title="FSSAI Verified">✓</span>}
                        </h1>
                        <p className="opacity-90 mt-2 max-w-2xl">{vendor.about}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Food:</span> {vendor.food_type === 'BOTH' ? 'Veg & Non-Veg' : vendor.food_type}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Rating:</span> ★ 4.8 (120 reviews)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Delivers to:</span> {JSON.parse(vendor.delivery_pincodes || '[]').length} Areas
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Col: Menu */}
                <div className="flex-1 space-y-8">

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">This Week's Menu</h2>
                                <p className="text-gray-500 text-sm mt-1">Menu subject to slight changes based on fresh ingredient availability.</p>
                            </div>
                            <div className="flex border rounded-lg overflow-hidden shrink-0">
                                <button
                                    onClick={() => setActiveMenuTab('LUNCH')}
                                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeMenuTab === 'LUNCH' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Lunch
                                </button>
                                <button
                                    onClick={() => setActiveMenuTab('DINNER')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors border-l ${activeMenuTab === 'DINNER' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Dinner
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {weekDays.map(day => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const item = menu.find(m => m.date.startsWith(dateStr) && m.meal_type === activeMenuTab);

                                return (
                                    <div key={dateStr} className={`flex gap-4 p-4 rounded-lg border ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
                                        <div className="w-16 shrink-0 text-center flex flex-col justify-center border-r pr-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{format(day, 'EEE')}</span>
                                            <span className="text-2xl font-medium text-gray-900">{format(day, 'd')}</span>
                                        </div>

                                        <div className="flex-1">
                                            {item ? (
                                                item.is_off_day ? (
                                                    <div className="h-full flex items-center text-gray-400 italic font-medium">Chef is taking a day off.</div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-lg text-gray-900">{item.name}</h4>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded text-white font-bold ${item.food_type === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}>{item.food_type}</span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                                                    </>
                                                )
                                            ) : (
                                                <div className="h-full flex items-center text-gray-300 italic">Menu not published yet</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Right Col: Plans & Checkout Sticky */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="sticky top-8 space-y-6">

                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold mb-4">Choose a Subscription</h2>

                            <div className="space-y-4">
                                {plans.length === 0 ? (
                                    <div className="text-gray-500 italic text-center py-4 bg-gray-50 rounded">No active plans available right now.</div>
                                ) : (
                                    plans.map(plan => (
                                        <div key={plan.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold group-hover:text-green-600">{plan.name}</h3>
                                                    <div className="text-xs text-gray-500">{plan.duration_days} Days · {plan.meal_type}</div>
                                                </div>
                                                <div className="text-lg font-extrabold text-gray-900">₹{plan.price}</div>
                                            </div>
                                            {plan.description && <p className="text-sm text-gray-600 mb-4">{plan.description}</p>}
                                            <Link
                                                to={`/checkout/${plan.id}`}
                                                className="block w-full text-center bg-green-50 text-green-700 font-medium py-2 rounded group-hover:bg-green-600 group-hover:text-white transition-colors"
                                            >
                                                Subscribe
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                {/* Info Icon Mock */}
                                <span className="bg-gray-300 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px]">i</span>
                                How Subscriptions Work
                            </h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Pause your subscription anytime if you're out of town.</li>
                                <li>Delivery times depend on the chef's windows.</li>
                                <li>Payments are processed securely via Dabbaz.</li>
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

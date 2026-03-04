import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface VendorProfile {
    id: number;
    slug: string;
    business_name: string;
    cover_photo_url: string;
    is_verified: boolean;
    cuisine_tags: string;
    food_type: string;
    delivery_pincodes: string;
    daily_capacity: number;
    active_subscriber_count: number;
}

export default function HomePage() {
    const [vendors, setVendors] = useState<VendorProfile[]>([]);
    const [search, setSearch] = useState('');
    const [foodTypeFilter, setFoodTypeFilter] = useState('ALL');
    const [pincodeFilter, setPincodeFilter] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (search) queryParams.append('search', search);
                if (foodTypeFilter !== 'ALL') queryParams.append('food_type', foodTypeFilter);
                if (pincodeFilter) queryParams.append('pincode', pincodeFilter);

                const res = await api.get(`/vendors/list?${queryParams.toString()}`);
                setVendors(res.data.vendors);
            } catch (error) {
                console.error("Failed to fetch vendors", error);
            }
        }
        fetchVendors();
    }, [search, foodTypeFilter, pincodeFilter]);

    return (
        <div className="bg-brand-base min-h-screen">
            {/* Hero Section */}
            <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-brand-primary rounded-l-full opacity-5 blur-3xl" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-text-primary sm:text-5xl md:text-6xl mb-6">
                        <span className="block">Find Home-Cooked</span>
                        <span className="block text-brand-primary">Tiffins Near You</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-text-secondary sm:text-lg md:mt-5 md:text-xl md:max-w-2xl mb-8">
                        Subscribe to verified local chefs. Authentic, hygienic, and daily fresh meals delivered right to your doorstep. Never worry about "what's for lunch?" again.
                    </p>

                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 p-4 card-neumorphic items-stretch">
                        <div className="flex-[2] relative">
                            <span className="absolute left-4 top-1/2 -translate-y-[55%] text-gray-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by vendor name or cuisine..."
                                className="input-neumorphic pl-12 h-full placeholder:text-[1.35rem]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:block w-px bg-gray-200/50 my-2"></div>
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-[55%] text-gray-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Enter PIN Code"
                                className="input-neumorphic pl-12 h-full placeholder:text-[1.35rem]"
                                value={pincodeFilter}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Only allow digits and max 6 characters
                                    if (val === '' || (/^\d+$/.test(val) && val.length <= 6)) {
                                        setPincodeFilter(val);
                                    }
                                }}
                                maxLength={6}
                            />
                        </div>
                        <button className="btn-skeuo-primary px-10 py-3 text-2xl font-bold w-full md:w-auto h-full">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 shrink-0 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium border-b pb-2 mb-4">Dietary Preference</h3>
                            <div className="space-y-2 text-sm">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" className="skeuo-radio" checked={foodTypeFilter === 'ALL'} onChange={() => setFoodTypeFilter('ALL')} name="diet" /> All
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" className="skeuo-radio" checked={foodTypeFilter === 'VEG'} onChange={() => setFoodTypeFilter('VEG')} name="diet" /> Pure Veg
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" className="skeuo-radio" checked={foodTypeFilter === 'NONVEG'} onChange={() => setFoodTypeFilter('NONVEG')} name="diet" /> Non-Veg
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vendors.map(vendor => {
                            const isFull = vendor.active_subscriber_count >= vendor.daily_capacity;
                            const cuisines = JSON.parse(vendor.cuisine_tags || '[]');
                            const pincodes = JSON.parse(vendor.delivery_pincodes || '[]');

                            return (
                                <div key={vendor.id} className="card-neumorphic p-0 overflow-hidden group flex flex-col">
                                    <div className="h-48 relative border-b-2 border-[#fff8f0]/40">
                                        {vendor.cover_photo_url ? (
                                            <img src={vendor.cover_photo_url} alt={vendor.business_name} className="w-full h-full object-cover shadow-[0_4px_10px_rgba(180,130,90,0.15)] relative z-10" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-secondary bg-brand-base shadow-[inset_2px_2px_6px_rgba(180,130,90,0.2)]">No Image</div>
                                        )}
                                        {isFull && (
                                            <div className="absolute top-3 right-3 z-20 bg-error text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                                                FULL
                                            </div>
                                        )}
                                        {vendor.food_type === 'VEG' && (
                                            <div className="absolute top-3 left-3 z-20 bg-success text-white p-1 rounded-full border border-white shadow-md" title="Pure Veg">
                                                {/* Leaf Icon mock */}
                                                <span className="text-[10px] px-1 font-bold">V</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-primary transition-colors">
                                                {vendor.business_name}
                                                {vendor.is_verified && <span className="ml-2 text-brand-secondary" title="Verified">✓</span>}
                                            </h3>
                                            {/* Hide ratings for now per user request
                                            <span className="bg-brand-base text-brand-primary text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-[inset_1px_1px_3px_rgba(180,130,90,0.2),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]">
                                                ★ 4.8
                                            </span>
                                            */}
                                        </div>

                                        <div className="text-sm text-text-secondary mb-4 line-clamp-1">
                                            {cuisines.slice(0, 3).join(', ')} {cuisines.length > 3 ? `+${cuisines.length - 3} more` : ''}
                                        </div>

                                        <div className="text-xs text-text-secondary mb-4 input-neumorphic p-3 rounded-xl mt-auto">
                                            <span className="font-bold text-text-primary">Delivers to:</span> {pincodes.slice(0, 2).join(', ')} {pincodes.length > 2 ? `+${pincodes.length - 2} more` : ''}
                                        </div>

                                        <Link
                                            to={`/chef/${vendor.slug}`}
                                            className={`block w-full text-center py-3 mt-2 rounded-xl font-bold transition-all ${isFull
                                                ? 'bg-brand-base text-text-secondary cursor-not-allowed shadow-[inset_2px_2px_5px_rgba(180,130,90,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.7)]'
                                                : 'btn-skeuo-primary'
                                                }`}
                                        >
                                            View Menu & Plans
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {vendors.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">No chefs found</h3>
                                <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-text-primary">How Dabbaz Works</h2>
                            <p className="mt-4 text-lg text-text-secondary">Simple, fresh, and delivered straight to you.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center">
                                <div className="bg-brand-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                                    <span className="text-2xl font-bold text-brand-secondary">1</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Find a Chef</h3>
                                <p className="text-text-secondary">Browse verified local home chefs in your area offering authentic regional cuisines.</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-brand-secondary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                                    <span className="text-2xl font-bold text-brand-primary">2</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Choose a Plan</h3>
                                <p className="text-text-secondary">Select a weekly or monthly subscription that fits your schedule and dietary needs.</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-brand-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                                    <span className="text-2xl font-bold text-brand-secondary">3</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Enjoy Daily Meals</h3>
                                <p className="text-text-secondary">Get fresh, hot meals delivered to your door every day, just like home.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-16 card-neumorphic m-4 md:m-8 overflow-hidden relative">
                    <div className="absolute inset-0 bg-brand-primary opacity-5 rounded-3xl" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                        <div className="text-center md:text-left mb-8 md:mb-0">
                            <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
                                <span className="block">Are you a great cook?</span>
                                <span className="block text-brand-primary">Turn your passion into a business.</span>
                            </h2>
                            <p className="mt-4 text-lg leading-6 text-text-secondary max-w-xl">
                                Join our community of verified home chefs. Manage subscriptions, get weekly payouts, and grow your customer base with zero hassle.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/become-a-chef" className="btn-skeuo-primary px-8 py-4 text-lg">
                                Become a Chef
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

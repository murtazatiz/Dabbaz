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
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-green-50/50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-1/2 bg-yellow-400 rounded-l-full opacity-10 blur-3xl" />
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                        <span className="block">Find Home-Cooked</span>
                        <span className="block text-green-600">Tiffins Near You</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-2xl mb-8">
                        Subscribe to verified local chefs. Authentic, hygienic, and daily fresh meals delivered right to your doorstep. Never worry about "what's for lunch?" again.
                    </p>

                    <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                        <div className="flex-1 relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by vendor name or cuisine..."
                                className="w-full pl-10 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:block w-px bg-gray-200 my-2"></div>
                        <div className="flex-1 relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Enter your PIN Code"
                                className="w-full pl-10 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                value={pincodeFilter}
                                onChange={(e) => setPincodeFilter(e.target.value)}
                            />
                        </div>
                        <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md w-full md:w-auto">
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
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={foodTypeFilter === 'ALL'} onChange={() => setFoodTypeFilter('ALL')} name="diet" /> All
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={foodTypeFilter === 'VEG'} onChange={() => setFoodTypeFilter('VEG')} name="diet" /> Pure Veg
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={foodTypeFilter === 'NONVEG'} onChange={() => setFoodTypeFilter('NONVEG')} name="diet" /> Non-Veg
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
                                <div key={vendor.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-gray-200 relative">
                                        {vendor.cover_photo_url ? (
                                            <img src={vendor.cover_photo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                        {isFull && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                FULL
                                            </div>
                                        )}
                                        {vendor.food_type === 'VEG' && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Pure Veg">
                                                {/* Leaf Icon mock */}
                                                <span className="text-[10px] px-1 font-bold">V</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600">
                                                {vendor.business_name}
                                                {vendor.is_verified && <span className="ml-2 text-blue-500" title="FSSAI Verified">✓</span>}
                                            </h3>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1 font-medium">
                                                ★ 4.8
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-4 line-clamp-1">
                                            {cuisines.slice(0, 3).join(', ')} {cuisines.length > 3 ? `+${cuisines.length - 3} more` : ''}
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                            <span className="font-medium text-gray-700">Delivers to:</span> {pincodes.slice(0, 2).join(', ')} {pincodes.length > 2 ? `+${pincodes.length - 2} more` : ''}
                                        </div>

                                        <Link
                                            to={`/chef/${vendor.slug}`}
                                            className={`block w-full text-center py-2 rounded-md font-medium transition-colors ${isFull
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
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
            </div>
        </div>
    );
}

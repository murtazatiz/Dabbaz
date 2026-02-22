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
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

            {/* Header & Search */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Find Home-Cooked Tiffins Near You</h1>
                <p className="text-xl text-gray-500 mb-8">Subscribe to verified local chefs and never worry about daily meals again.</p>

                <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by vendor name or cuisine..."
                        className="flex-1 border rounded-lg p-3 shadow-sm focus:ring-green-500 focus:border-green-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter your PIN Code"
                        className="w-full md:w-48 border rounded-lg p-3 shadow-sm focus:ring-green-500 focus:border-green-500"
                        value={pincodeFilter}
                        onChange={(e) => setPincodeFilter(e.target.value)}
                    />
                </div>
            </div>

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
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No vendors found matching your criteria. Try loosening your filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

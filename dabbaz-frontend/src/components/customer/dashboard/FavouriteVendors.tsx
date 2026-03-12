import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface FavouriteVendor {
    vendorId: number;
    vendorName: string;
    coverPhoto: string | null;
    cuisineType: string;
    foodType: string;
}

interface Props {
    favourites: FavouriteVendor[];
    onUnfavourite: (vendorId: number) => void;
}

const FavouriteVendors: React.FC<Props> = ({ favourites, onUnfavourite }) => {
    if (favourites.length === 0) return null;

    return (
        <div className="w-full mt-10 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Your Favourite Kitchens
                </h3>
            </div>

            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-1" style={{ scrollSnapType: 'x mandatory' }}>
                {favourites.map(vendor => (
                    <div
                        key={vendor.vendorId}
                        className="flex-none w-[140px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <Link to={`/vendor/${vendor.vendorId}`} className="block relative h-28 bg-gray-100">
                            {vendor.coverPhoto ? (
                                <img src={vendor.coverPhoto} alt={vendor.vendorName} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                    <span className="text-xs">No Photo</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm(`Remove ${vendor.vendorName} from favourites?`)) {
                                        onUnfavourite(vendor.vendorId);
                                    }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-all shadow-sm"
                                aria-label="Remove favourite"
                            >
                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </button>

                            {vendor.foodType && (
                                <div className="absolute bottom-2 left-2">
                                    <span className={`inline-block w-3 h-3 border rounded-sm flex-shrink-0 ${vendor.foodType === 'VEG' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                                        <span className={`block w-1.5 h-1.5 m-[2px] rounded-full ${vendor.foodType === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                    </span>
                                </div>
                            )}
                        </Link>

                        <Link to={`/vendor/${vendor.vendorId}`} className="block p-3">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{vendor.vendorName}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold truncate mt-0.5">
                                {vendor.cuisineType}
                            </p>
                        </Link>
                    </div>
                ))}

                <div className="flex-none flex items-center justify-center w-[120px] bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <Link to="/profile" className="text-xs font-semibold text-brand-secondary hover:underline px-4 text-center">
                        Manage favourites
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FavouriteVendors;

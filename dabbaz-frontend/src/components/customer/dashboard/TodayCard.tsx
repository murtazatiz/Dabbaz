import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, MapPin, Clock, XCircle } from 'lucide-react';
import OrderProgressTracker from './OrderProgressTracker';

type OrderStatus = 'CONFIRMED' | 'BEING_PREPARED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'READY_FOR_COLLECTION' | 'COLLECTED' | 'CANCELLED';

interface SlotData {
    slotType: 'LUNCH' | 'DINNER';
    orderId: number;
    vendorId: number;
    vendorName: string;
    mealName: string;
    portions: number;
    addons: string[];
    fulfilmentType: 'DELIVERY' | 'COLLECTION';
    deliveryAddress: string | null;
    deliveryWindow: string | null;
    collectionAddress: string | null;
    collectionWindow: string | null;
    status: OrderStatus;
    orderValue: number;
    cancellationAllowed: boolean;
}

interface Props {
    todayData: {
        date: string;
        hasOrders: boolean;
        slots: SlotData[];
    } | null;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'CONFIRMED': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'BEING_PREPARED': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'OUT_FOR_DELIVERY':
        case 'READY_FOR_COLLECTION': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'DELIVERED':
        case 'COLLECTED': return 'bg-green-100 text-green-800 border-green-200';
        case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const TodayCard: React.FC<Props> = ({ todayData }) => {
    if (!todayData) return null;

    // Formatting date: e.g. "Wednesday, 11th March"
    const dateObj = new Date(todayData.date);
    const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    const headerTitle = `Today — ${dayName}, ${formattedDate}`;

    if (!todayData.hasOrders || todayData.slots.length === 0) {
        return (
            <div className="bg-white rounded-[14px] p-8 shadow-sm border-l-4 border-l-brand-primary/50 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                    <Sun className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Nothing on the menu for today
                </h3>
                <p className="text-gray-500 mb-6 font-medium text-sm">Discover home kitchens near you</p>
                <Link
                    to="/browse"
                    className="inline-block bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-full shadow-md transition-all active:scale-95"
                >
                    Browse Kitchens
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[14px] shadow-sm border-l-4 border-l-brand-primary p-5">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {headerTitle}
            </h2>

            <div className="space-y-6">
                {todayData.slots.map((slot, index) => (
                    <div key={slot.orderId} className={index > 0 ? "pt-6 border-t border-gray-100" : ""}>

                        {/* Slot Header */}
                        <div className="flex items-center gap-2 mb-3">
                            {slot.slotType === 'LUNCH' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                            <span className="font-bold tracking-widest uppercase text-xs text-gray-500">
                                {slot.slotType}
                            </span>
                        </div>

                        {/* Order Details */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <Link to={`/vendor/${slot.vendorId}`} className="text-sm font-semibold text-brand-secondary hover:underline">
                                    {slot.vendorName}
                                </Link>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <h3 className="text-xl font-bold text-gray-900">{slot.mealName}</h3>
                                    {slot.portions > 1 && <span className="text-sm font-bold text-gray-500">×{slot.portions}</span>}
                                </div>
                                {slot.addons.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        + {slot.addons.join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Status and Fulfilment Badges */}
                            <div className="flex flex-col md:items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {slot.fulfilmentType}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${getStatusColor(slot.status)}`}>
                                        {slot.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logistics info */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {slot.fulfilmentType === 'DELIVERY' ? (
                                <>
                                    <div className="flex items-start gap-2 flex-1">
                                        <Clock className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
                                        <span><strong className="font-semibold">Expected:</strong> {slot.deliveryWindow || 'TBD'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 flex-1">
                                        <MapPin className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{slot.deliveryAddress}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-2 flex-1">
                                        <Clock className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
                                        <span><strong className="font-semibold">Pickup:</strong> {slot.collectionWindow || 'TBD'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 flex-1">
                                        <MapPin className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{slot.collectionAddress}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Progress Tracker */}
                        {slot.status !== 'CANCELLED' && (
                            <div className="mt-4 mb-2">
                                <OrderProgressTracker status={slot.status} fulfilmentType={slot.fulfilmentType} />
                            </div>
                        )}

                        {/* Allowed Actions */}
                        {slot.cancellationAllowed && (
                            <div className="mt-4 pt-2 flex justify-end">
                                <button className="text-xs font-semibold text-gray-500 hover:text-red-600 hover:underline flex items-center gap-1 transition-colors">
                                    <XCircle className="w-3 h-3" />
                                    Cancel order
                                </button>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayCard;

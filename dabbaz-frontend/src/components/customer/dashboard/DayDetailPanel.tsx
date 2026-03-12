import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, MapPin, Clock, XCircle, Search } from 'lucide-react';
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
    dayData: {
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

const DayDetailPanel: React.FC<Props> = ({ dayData }) => {
    if (!dayData) return null;

    const dateObj = new Date(dayData.date);
    const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const headerTitle = `${dayName}, ${formattedDate}`;

    if (!dayData.hasOrders || dayData.slots.length === 0) {
        return (
            <div className="bg-[#FFF8F5] p-6 border-l-4 border-l-gray-300 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{headerTitle}</h3>
                <div className="flex flex-col items-center justify-center py-8">
                    <Search className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium mb-4">No orders for this day</p>
                    <Link
                        to="/browse"
                        className="bg-brand-primary text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-brand-secondary transition-colors"
                    >
                        Browse Kitchens
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[14px] shadow-sm border border-gray-100 mt-2 relative">
            {/* The selected column pointer arrow style (CSS trick) */}
            <div className="absolute -top-3 left-6 w-6 h-6 bg-white rotate-45 border-t border-l border-gray-100 hidden sm:block" />

            <h3 className="text-lg font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4 relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                {headerTitle}
            </h3>

            <div className="grid gap-6">
                {dayData.slots.map((slot) => (
                    <div key={slot.orderId} className="bg-white border rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                {slot.slotType === 'LUNCH' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                                <span className="font-bold tracking-widest uppercase text-xs text-brand-secondary">
                                    {slot.slotType}
                                </span>
                            </div>
                            <span className="font-bold text-lg text-gray-900">₹{slot.orderValue}</span>
                        </div>

                        <Link to={`/vendor/${slot.vendorId}`} className="text-sm font-semibold text-gray-500 hover:text-brand-primary hover:underline transition-colors">
                            {slot.vendorName}
                        </Link>

                        <div className="mt-1 flex items-baseline gap-2 mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{slot.mealName}</h3>
                            {slot.portions > 1 && <span className="text-sm font-bold text-gray-500">×{slot.portions}</span>}
                        </div>

                        {slot.addons.length > 0 && (
                            <p className="text-xs text-gray-500 mb-4 font-medium">
                                + {slot.addons.join(', ')}
                            </p>
                        )}

                        {/* Logistics info */}
                        <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-white text-gray-600 px-2 py-1 rounded shadow-sm">
                                    {slot.fulfilmentType}
                                </span>
                            </div>
                            {slot.fulfilmentType === 'DELIVERY' ? (
                                <div className="flex items-start gap-2 flex-1">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <span><strong className="font-semibold text-gray-700">Expected:</strong> {slot.deliveryWindow || 'TBD'}</span>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 flex-1">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <span><strong className="font-semibold text-gray-700">Pickup:</strong> {slot.collectionWindow || 'TBD'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border ${getStatusColor(slot.status)}`}>
                                {slot.status.replace(/_/g, ' ')}
                            </span>

                            {slot.cancellationAllowed && (
                                <button className="text-xs font-semibold text-gray-400 hover:text-red-500 hover:underline transition-colors flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>

                        {slot.status !== 'CANCELLED' && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <OrderProgressTracker status={slot.status} fulfilmentType={slot.fulfilmentType} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DayDetailPanel;

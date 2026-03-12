import React from 'react';
import { Link } from 'react-router-dom';

interface PastOrder {
    orderId: number;
    vendorId: number;
    vendorName: string;
    vendorCoverPhoto: string | null;
    date: string;
    slotType: 'LUNCH' | 'DINNER';
    mealName: string;
    portions: number;
    orderValue: number;
    status: string;
}

interface Props {
    orders: PastOrder[];
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
}

const PastOrders: React.FC<Props> = ({ orders, hasMore, onLoadMore, loading }) => {
    return (
        <div className="w-full mt-10 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Past Orders
            </h3>

            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium text-sm">No past orders yet. Your order history will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const isCancelled = order.status === 'CANCELLED';
                        const dateObj = new Date(order.date);
                        const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

                        return (
                            <div
                                key={order.orderId}
                                className={`bg-white rounded-[12px] p-4 flex items-center justify-between border transition-all ${isCancelled ? 'opacity-60 border-gray-100 grayscale-[0.5]' : 'border-gray-100 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden hidden sm:block border">
                                        {order.vendorCoverPhoto ? (
                                            <img src={order.vendorCoverPhoto} alt={order.vendorName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold">PIC</div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{order.vendorName}</h4>
                                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-1 mb-1">
                                            {formattedDate}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-brand-secondary font-bold">
                                            <span className="bg-orange-50 px-1 py-0.5 rounded text-[9px] uppercase tracking-widest">{order.slotType}</span>
                                            <span className={`text-gray-800 font-semibold ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                                                {order.mealName} {order.portions > 1 && `(×${order.portions})`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end shrink-0 gap-3 ml-4">
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900 text-sm">₹{order.orderValue}</span>
                                        <span className={`text-[9px] uppercase tracking-wider font-bold ${isCancelled ? 'text-red-500' : 'text-green-600'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/vendor/${order.vendorId}`}
                                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${isCancelled ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                                    >
                                        Order again
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-sm font-bold text-brand-secondary hover:underline disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PastOrders;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useCart } from '../../store/cart.store';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, isLoading } = useCart();

    const [addressLine, setAddressLine] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Group items by vendor for minimum portion validation
    const vendorPortions: Record<number, number> = {};
    items.forEach(item => {
        vendorPortions[item.vendor_id] = (vendorPortions[item.vendor_id] || 0) + item.quantity;
    });

    const invalidVendors = Object.entries(vendorPortions).filter(([_, portions]) => portions < 3);

    const itemsTotal = items.reduce((sum, item) => sum + (100 * item.quantity), 0);
    const platformFee = 20;

    // To calculate delivery we need unique occurrences (vendor + date + meal)
    const deliveryOccurrences = new Set<string>();
    let deliveryTotal = 0;

    items.forEach(item => {
        if (item.fulfillment_mode === 'DELIVERY') {
            const occurrenceKey = `${item.vendor_id}-${new Date(item.delivery_date).toISOString().split('T')[0]}-${item.meal_type}`;
            if (!deliveryOccurrences.has(occurrenceKey)) {
                deliveryOccurrences.add(occurrenceKey);
                deliveryTotal += Number(item.vendor.delivery_charge || 0);
            }
        }
    });

    const gstFood = itemsTotal * 0.03;
    const gstDelivery = deliveryTotal * 0.18;
    const finalAmount = itemsTotal + deliveryTotal + platformFee + gstFood + gstDelivery;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (invalidVendors.length > 0) {
            alert('Please ensure you have at least 3 portions for every chef in your cart.');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                platform_fee_total: platformFee,
                delivery_address: JSON.stringify({ addressLine, landmark, pincode })
            };

            // Call standard backend create endpoint (mapped to cart in Phase 2)
            const res = await api.post('/subscriptions/create', payload);
            const { razorpayOrderId, amount } = res.data;

            // MOCK Razorpay Checkout
            alert(`Mock Razorpay Widget Opens Here for ₹${amount}`);

            // Simulate success callback
            await api.post('/subscriptions/verify-payment', {
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_order_id: razorpayOrderId,
                razorpay_signature: 'signature_mock'
            });

            alert('Payment Successful! Your orders have been placed.');
            navigate('/dashboard'); // Customer dashboard

        } catch (e: any) {
            alert(e.response?.data?.message || 'Error processing checkout');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading checkout...</div>;

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="text-green-600 font-medium hover:underline">
                    Browse Chefs
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8">

            {/* Checkout Form */}
            <div className="flex-1 space-y-8">
                {invalidVendors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="text-xl">⚠️</span> Minimum Order Requirement
                        </h3>
                        <p className="text-sm mt-1">To ensure efficiency for our home chefs, please add at least 3 portions per chef.</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-4">Delivery Address</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Complete Address</label>
                                    <textarea required value={addressLine} onChange={e => setAddressLine(e.target.value)} rows={3} className="w-full border rounded p-2" placeholder="House/Flat No., Building, Street Area..."></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">PIN Code</label>
                                        <input required value={pincode} onChange={e => setPincode(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. 400001" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
                                        <input value={landmark} onChange={e => setLandmark(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Near Post Office" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Order Summary */}
            <div className="w-full md:w-96 shrink-0">
                <div className="bg-gray-50 rounded-xl border p-6 sticky top-8">
                    <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                    <div className="space-y-4 text-sm mb-6 max-h-64 overflow-y-auto pr-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-start border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <span className="font-medium text-gray-900">{item.menu_item.name}</span>
                                    <div className="text-xs text-gray-500">{item.vendor.business_name} • {item.meal_type}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} • {item.fulfillment_mode}</div>
                                </div>
                                <span className="font-medium">₹{100 * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 text-sm mb-6 py-4 border-y border-gray-200">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span>₹{itemsTotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Partner Fee</span>
                            <span>₹{deliveryTotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Taxes (GST)</span>
                            <span>₹{(gstFood + gstDelivery).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-xl mb-6">
                        <span>To Pay</span>
                        <span>₹{finalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        form="checkout-form"
                        type="submit"
                        disabled={invalidVendors.length > 0 || isProcessing}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-opacity"
                    >
                        {isProcessing ? 'Processing...' : `Proceed to Pay (₹${finalAmount.toFixed(2)})`}
                    </button>

                    <p className="text-xs text-gray-500 mt-4 text-center">Secure payment powered by Razorpay.</p>
                </div>
            </div>

        </div>
    );
}

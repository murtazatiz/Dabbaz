import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import api from '../../lib/api';

export default function CheckoutPage() {
    const { planId } = useParams();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Address form (simplified)
    const [addressLine, setAddressLine] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await api.get(`/subscriptions/plan-meta/${planId}`);
                setPlan(res.data.plan);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch plan", error);
            }
        };
        fetchMeta();
    }, [planId]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                plan_id: Number(planId),
                start_date: startDate,
                delivery_address: JSON.stringify({ addressLine, landmark, pincode })
            };

            const res = await api.post('/subscriptions/create', payload);
            const subscription = res.data.subscription;

            // MOCK Razorpay Checkout
            alert('Mock Razorpay Widget Opens Here for ₹' + subscription.total_amount);

            // Simulate success callback
            await api.post('/subscriptions/verify-payment', {
                subscription_id: subscription.id,
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_order_id: 'order_mock_' + Date.now(),
                razorpay_signature: 'signature_mock'
            });

            alert('Payment Successful! Subscription Active.');
            navigate('/dashboard'); // Customer dashboard

        } catch (e: any) {
            alert(e.response?.data?.message || 'Error creating subscription');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8">

            {/* Checkout Form */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
                <form onSubmit={handleCheckout} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Subscriptions must start at least 1 day from today.</p>
                    </div>

                    <div className="border-t pt-6">
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

                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                        Proceed to Payment (₹{plan.price})
                    </button>
                </form>
            </div>

            {/* Order Summary */}
            <div className="w-full md:w-80 shrink-0">
                <div className="bg-gray-50 rounded-xl border p-6 sticky top-8">
                    <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-200">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Plan</span>
                            <span className="font-medium">{plan.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Chef</span>
                            <span className="font-medium">{plan.vendor.business_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{plan.duration_days} Days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery</span>
                            <span className="font-medium">{plan.meal_type}</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Payable</span>
                        <span>₹{plan.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">Taxes & Delivery included. Secure payment powered by Razorpay.</p>
                </div>
            </div>

        </div>
    );
}

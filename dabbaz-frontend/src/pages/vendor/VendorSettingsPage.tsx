import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function VendorSettingsPage() {
    const [profile, setProfile] = useState<any>(null);

    // Form states
    const [businessName, setBusinessName] = useState('');
    const [about, setAbout] = useState('');
    const [foodType, setFoodType] = useState('BOTH');
    const [dailyCapacity, setDailyCapacity] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Delivery settings
    const [pincodeInput, setPincodeInput] = useState('');
    const [deliveryPincodes, setDeliveryPincodes] = useState<string[]>([]);
    const [lunchStart, setLunchStart] = useState('');
    const [lunchEnd, setLunchEnd] = useState('');
    const [dinnerStart, setDinnerStart] = useState('');
    const [dinnerEnd, setDinnerEnd] = useState('');

    // Bank details
    const [bankName, setBankName] = useState('');
    const [accNumber, setAccNumber] = useState('');
    const [ifsc, setIfsc] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/vendors/profile');
                const data = res.data.profile;
                setProfile(data);

                setBusinessName(data.business_name);
                setAbout(data.about);
                setFoodType(data.food_type);
                setDailyCapacity(data.daily_capacity);
                setIsActive(data.is_active);

                setDeliveryPincodes(JSON.parse(data.delivery_pincodes || '[]'));
                setLunchStart(data.lunch_window_start || '');
                setLunchEnd(data.lunch_window_end || '');
                setDinnerStart(data.dinner_window_start || '');
                setDinnerEnd(data.dinner_window_end || '');

                setBankName(data.bank_account_name);
                setAccNumber(data.bank_account_number);
                setIfsc(data.bank_ifsc);
            } catch (error) {
                console.error('Failed to load profile', error);
            }
        };
        fetchProfile();
    }, []);

    const handleAddPincode = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && pincodeInput.trim()) {
            if (!deliveryPincodes.includes(pincodeInput.trim())) {
                setDeliveryPincodes([...deliveryPincodes, pincodeInput.trim()]);
            }
            setPincodeInput('');
        }
    };

    const removePincode = (code: string) => {
        setDeliveryPincodes(deliveryPincodes.filter(p => p !== code));
    };

    const handleSave = async () => {
        try {
            await api.patch('/vendors/profile', {
                business_name: businessName,
                about,
                food_type: foodType,
                daily_capacity: Number(dailyCapacity),
                is_active: isActive,
                delivery_pincodes: JSON.stringify(deliveryPincodes),
                lunch_window_start: lunchStart,
                lunch_window_end: lunchEnd,
                dinner_window_start: dinnerStart,
                dinner_window_end: dinnerEnd,
                bank_account_name: bankName,
                bank_account_number: accNumber,
                bank_ifsc: ifsc
            });
            alert('Profile updated successfully!');
        } catch (e) {
            alert('Failed to update profile');
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Vendor Settings</h1>

            <div className="bg-white shadow rounded-lg p-6 space-y-8">

                {/* Basic Info */}
                <section>
                    <h2 className="text-lg font-medium border-b pb-2 mb-4">Basic Info</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">Business Name</label>
                            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm">About</label>
                            <textarea value={about} onChange={e => setAbout(e.target.value)} className="w-full border rounded p-2 h-24" />
                        </div>
                        <div>
                            <label className="block text-sm">Food Type</label>
                            <select value={foodType} onChange={e => setFoodType(e.target.value)} className="w-full border rounded p-2">
                                <option value="VEG">Vegetarian Only</option>
                                <option value="NONVEG">Non-Vegetarian Only</option>
                                <option value="BOTH">Both</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Delivery Settings */}
                <section>
                    <h2 className="text-lg font-medium border-b pb-2 mb-4">Delivery Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">Delivery PIN Codes (Press Enter to add)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {deliveryPincodes.map(pin => (
                                    <span key={pin} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                                        {pin}
                                        <button onClick={() => removePincode(pin)} className="ml-2 text-red-500 font-bold">&times;</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={pincodeInput}
                                onChange={e => setPincodeInput(e.target.value)}
                                onKeyDown={handleAddPincode}
                                placeholder="e.g. 400001"
                                className="w-full border rounded p-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Lunch Delivery Window</label>
                                <div className="flex gap-2">
                                    <input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)} className="w-full border rounded p-2" />
                                    <span className="self-center">to</span>
                                    <input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Dinner Delivery Window</label>
                                <div className="flex gap-2">
                                    <input type="time" value={dinnerStart} onChange={e => setDinnerStart(e.target.value)} className="w-full border rounded p-2" />
                                    <span className="self-center">to</span>
                                    <input type="time" value={dinnerEnd} onChange={e => setDinnerEnd(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Capacity */}
                <section>
                    <h2 className="text-lg font-medium border-b pb-2 mb-4">Capacity & Availability</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Max Subscribers Per Day</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={dailyCapacity}
                                    onChange={e => setDailyCapacity(Number(e.target.value))}
                                    className="w-32 border rounded p-2"
                                />
                                <span className="text-sm text-gray-500">Currently filled: {profile.active_subscriber_count}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="activeToggle"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                                className="w-4 h-4 text-green-600"
                            />
                            <label htmlFor="activeToggle" className="text-sm font-medium">Accepting new subscriptions</label>
                        </div>
                    </div>
                </section>

                {/* Bank */}
                <section>
                    <h2 className="text-lg font-medium border-b pb-2 mb-4">Bank Details (Payouts)</h2>
                    <p className="text-xs text-gray-500 mb-4">Your bank details are encrypted and used only for weekly payouts.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm">Account Holder Name</label>
                            <input value={bankName} onChange={e => setBankName(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm">Account Number</label>
                            <input type="password" value={accNumber} onChange={e => setAccNumber(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm">IFSC Code</label>
                            <input value={ifsc} onChange={e => setIfsc(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </div>
                </section>

                <div className="pt-4 border-t">
                    <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700">
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AddonLibrary from '../../components/vendor/AddonLibrary';

export default function VendorSettingsPage() {
    const [profile, setProfile] = useState<any>(null);

    // Form states
    const [businessName, setBusinessName] = useState('');
    const [about, setAbout] = useState('');
    const [foodType, setFoodType] = useState('BOTH');
    const [dailyCapacity, setDailyCapacity] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // Delivery settings
    const [deliveryCharge, setDeliveryCharge] = useState<number | ''>('');
    const [pincodeInput, setPincodeInput] = useState('');
    const [deliveryPincodes, setDeliveryPincodes] = useState<string[]>([]);
    const [lunchStart, setLunchStart] = useState('');
    const [lunchEnd, setLunchEnd] = useState('');
    const [dinnerStart, setDinnerStart] = useState('');
    const [dinnerEnd, setDinnerEnd] = useState('');

    // Collection Settings
    const [collectionEnabled, setCollectionEnabled] = useState(false);
    const [collectionAddressLunch, setCollectionAddressLunch] = useState('');
    const [collectionAddressDinner, setCollectionAddressDinner] = useState('');
    const [collectionLunchStart, setCollectionLunchStart] = useState('');
    const [collectionLunchEnd, setCollectionLunchEnd] = useState('');
    const [collectionDinnerStart, setCollectionDinnerStart] = useState('');
    const [collectionDinnerEnd, setCollectionDinnerEnd] = useState('');

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
                setDeliveryCharge(data.delivery_charge || '');
                setLunchStart(data.lunch_window_start || '');
                setLunchEnd(data.lunch_window_end || '');
                setDinnerStart(data.dinner_window_start || '');
                setDinnerEnd(data.dinner_window_end || '');

                setCollectionEnabled(data.collection_enabled || false);
                setCollectionAddressLunch(data.collection_address_lunch || '');
                setCollectionAddressDinner(data.collection_address_dinner || '');
                setCollectionLunchStart(data.collection_lunch_window_start || '');
                setCollectionLunchEnd(data.collection_lunch_window_end || '');
                setCollectionDinnerStart(data.collection_dinner_window_start || '');
                setCollectionDinnerEnd(data.collection_dinner_window_end || '');

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
                delivery_charge: deliveryCharge === '' ? null : Number(deliveryCharge),
                lunch_window_start: lunchStart,
                lunch_window_end: lunchEnd,
                dinner_window_start: dinnerStart,
                dinner_window_end: dinnerEnd,
                collection_enabled: collectionEnabled,
                collection_address_lunch: collectionAddressLunch,
                collection_address_dinner: collectionAddressDinner,
                collection_lunch_window_start: collectionLunchStart,
                collection_lunch_window_end: collectionLunchEnd,
                collection_dinner_window_start: collectionDinnerStart,
                collection_dinner_window_end: collectionDinnerEnd,
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
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-extrabold mb-8 text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Vendor Settings</h1>

                <div className="card-neumorphic space-y-10">

                    {/* Basic Info */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-5 text-text-primary">Basic Info</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Business Name</label>
                                <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="input-neumorphic w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">About</label>
                                <textarea value={about} onChange={e => setAbout(e.target.value)} className="input-neumorphic w-full h-24" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Food Type</label>
                                <select value={foodType} onChange={e => setFoodType(e.target.value)} className="input-neumorphic w-full">
                                    <option value="VEG">Vegetarian Only</option>
                                    <option value="NONVEG">Non-Vegetarian Only</option>
                                    <option value="BOTH">Both</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Settings */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-5 text-text-primary">Delivery Settings</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Delivery PIN Codes (Press Enter to add)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {deliveryPincodes.map(pin => (
                                        <span key={pin} className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-inner inset-shadow-sm border border-brand-primary/20">
                                            {pin}
                                            <button onClick={() => removePincode(pin)} className="ml-2 hover:text-brand-secondary transition-colors">&times;</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    value={pincodeInput}
                                    onChange={e => setPincodeInput(e.target.value)}
                                    onKeyDown={handleAddPincode}
                                    placeholder="e.g. 400001"
                                    className="input-neumorphic w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Delivery Charge (₹ per trip)</label>
                                <input
                                    type="number"
                                    value={deliveryCharge}
                                    onChange={e => setDeliveryCharge(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="input-neumorphic w-1/3"
                                    placeholder="Leave empty for free delivery"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Lunch Delivery Window</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)} className="input-neumorphic w-full" />
                                        <span className="font-bold text-text-secondary">to</span>
                                        <input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)} className="input-neumorphic w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Dinner Delivery Window</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="time" value={dinnerStart} onChange={e => setDinnerStart(e.target.value)} className="input-neumorphic w-full" />
                                        <span className="font-bold text-text-secondary">to</span>
                                        <input type="time" value={dinnerEnd} onChange={e => setDinnerEnd(e.target.value)} className="input-neumorphic w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Collection Settings */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-5 text-text-primary">Self-Pickup (Collection)</h2>
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 mb-5 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                <input
                                    type="checkbox"
                                    id="collectionToggle"
                                    checked={collectionEnabled}
                                    onChange={e => setCollectionEnabled(e.target.checked)}
                                    className="w-5 h-5 skeuo-radio text-brand-primary"
                                />
                                <label htmlFor="collectionToggle" className="font-bold text-text-primary cursor-pointer">Enable Self-Pickup for Customers</label>
                            </div>

                            {collectionEnabled && (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Lunch Pickup Address</label>
                                            <textarea value={collectionAddressLunch} onChange={e => setCollectionAddressLunch(e.target.value)} className="input-neumorphic w-full h-16" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Lunch Pickup Window</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="time" value={collectionLunchStart} onChange={e => setCollectionLunchStart(e.target.value)} className="input-neumorphic w-full" />
                                                <span className="font-bold text-text-secondary">to</span>
                                                <input type="time" value={collectionLunchEnd} onChange={e => setCollectionLunchEnd(e.target.value)} className="input-neumorphic w-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Dinner Pickup Address</label>
                                            <textarea value={collectionAddressDinner} onChange={e => setCollectionAddressDinner(e.target.value)} className="input-neumorphic w-full h-16" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Dinner Pickup Window</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="time" value={collectionDinnerStart} onChange={e => setCollectionDinnerStart(e.target.value)} className="input-neumorphic w-full" />
                                                <span className="font-bold text-text-secondary">to</span>
                                                <input type="time" value={collectionDinnerEnd} onChange={e => setCollectionDinnerEnd(e.target.value)} className="input-neumorphic w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Capacity */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-5 text-text-primary">Capacity & Availability</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Max Subscribers Per Day</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={dailyCapacity}
                                        onChange={e => setDailyCapacity(Number(e.target.value))}
                                        className="input-neumorphic w-32"
                                    />
                                    <span className="text-sm font-bold text-text-secondary">Currently filled: {profile.active_subscriber_count}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-success/5 rounded-xl border border-success/10">
                                <input
                                    type="checkbox"
                                    id="activeToggle"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="w-5 h-5 skeuo-radio text-success"
                                />
                                <label htmlFor="activeToggle" className="text-sm font-bold text-text-primary cursor-pointer">Accepting new subscriptions</label>
                            </div>
                        </div>
                    </section>

                    {/* Add-on Library */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-5 text-text-primary">Add-on Library</h2>
                        <AddonLibrary />
                    </section>

                    {/* Bank */}
                    <section>
                        <h2 className="text-xl font-bold border-b border-brand-primary/10 pb-3 mb-3 text-text-primary">Bank Details (Payouts)</h2>
                        <p className="text-sm text-text-secondary font-medium mb-5 bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10">Your bank details are encrypted and used only for weekly payouts.</p>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Account Holder Name</label>
                                <input value={bankName} onChange={e => setBankName(e.target.value)} className="input-neumorphic w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">Account Number</label>
                                <input type="password" value={accNumber} onChange={e => setAccNumber(e.target.value)} className="input-neumorphic w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-2">IFSC Code</label>
                                <input value={ifsc} onChange={e => setIfsc(e.target.value)} className="input-neumorphic w-full" />
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-brand-primary/10 flex justify-end">
                        <button onClick={handleSave} className="btn-skeuo-primary px-8 py-3 w-full md:w-auto">
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

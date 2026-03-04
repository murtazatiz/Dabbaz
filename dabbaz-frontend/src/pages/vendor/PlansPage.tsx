import { useState, useEffect } from 'react';
import api from '../../lib/api';

interface Plan {
    id: number;
    name: string;
    duration_days: number;
    meal_type: string;
    food_type: string;
    price: string;
    is_active: boolean;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [duration, setDuration] = useState(7);
    const [mealType, setMealType] = useState('LUNCH');
    const [foodType, setFoodType] = useState('VEG');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [autoRenewal, setAutoRenewal] = useState(true);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/vendors/plans');
            setPlans(res.data.plans);
        } catch {
            console.error("Error fetching plans");
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const openModal = (plan?: Plan) => {
        if (plan) {
            setEditingId(plan.id);
            setName(plan.name);
            setDuration(plan.duration_days);
            setMealType(plan.meal_type);
            setFoodType(plan.food_type);
            setPrice(plan.price);
            // ...set others if needed
        } else {
            setEditingId(null);
            setName('');
            setDuration(7);
            setPrice('');
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                name,
                duration_days: Number(duration),
                meal_type: mealType,
                food_type: foodType,
                price: Number(price),
                description,
                auto_renewal_default: autoRenewal
            };

            if (editingId) {
                await api.patch(`/vendors/plans/${editingId}`, payload);
            } else {
                await api.post('/vendors/plans', payload);
            }
            setShowModal(false);
            fetchPlans();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error saving plan');
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/vendors/plans/${id}/toggle`);
            fetchPlans();
        } catch {
            alert('Error toggling status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await api.delete(`/vendors/plans/${id}`);
            fetchPlans();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error deleting plan');
        }
    };

    return (
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Subscription Plans</h1>
                    <button onClick={() => openModal()} className="btn-skeuo-primary px-6 py-2">
                        Create New Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="card-neumorphic space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-extrabold text-xl text-text-primary">{plan.name}</h3>
                                    <p className="text-sm font-bold text-text-secondary mt-1">{plan.duration_days} Days · {plan.meal_type} · {plan.food_type}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner inset-shadow-sm border ${plan.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>
                                    {plan.is_active ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            <div className="text-2xl font-extrabold text-brand-secondary">₹{plan.price}</div>
                            <div className="flex gap-3 pt-4 border-t border-brand-primary/10">
                                <button onClick={() => openModal(plan)} className="flex-1 btn-skeuo py-2 text-sm">Edit</button>
                                <button onClick={() => handleToggle(plan.id)} className="flex-1 btn-skeuo py-2 text-sm">
                                    {plan.is_active ? 'Pause' : 'Activate'}
                                </button>
                                <button onClick={() => handleDelete(plan.id)} className="flex-1 btn-skeuo py-2 text-sm border-error text-error hover:bg-error/10">Delete</button>
                            </div>
                        </div>
                    ))}
                    {plans.length === 0 && <p className="text-text-secondary font-medium col-span-2 text-center py-8">No plans created yet.</p>}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="card-glass w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-extrabold mb-6 text-text-primary border-b border-white/20 pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{editingId ? 'Edit Plan' : 'Create Plan'}</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">Plan Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekly Dabba" className="input-neumorphic w-full bg-white/50" />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Duration (Days)</label>
                                        <input type="number" min="4" value={duration} onChange={e => setDuration(Number(e.target.value))} className="input-neumorphic w-full bg-white/50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Price (INR)</label>
                                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-neumorphic w-full bg-white/50" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Meal Type</label>
                                        <select value={mealType} onChange={e => setMealType(e.target.value)} className="input-neumorphic w-full bg-white/50">
                                            <option value="LUNCH">Lunch Only</option>
                                            <option value="DINNER">Dinner Only</option>
                                            <option value="BOTH">Lunch + Dinner</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Food Type</label>
                                        <select value={foodType} onChange={e => setFoodType(e.target.value)} className="input-neumorphic w-full bg-white/50">
                                            <option value="VEG">Vegetarian</option>
                                            <option value="NONVEG">Non-Vegetarian</option>
                                            <option value="BOTH">Mix</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-2 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                    <input
                                        type="checkbox"
                                        id="autoRenew"
                                        checked={autoRenewal}
                                        onChange={e => setAutoRenewal(e.target.checked)}
                                        className="w-5 h-5 skeuo-radio text-brand-primary"
                                    />
                                    <label htmlFor="autoRenew" className="text-sm font-bold text-text-primary cursor-pointer">Enable auto-renewal by default</label>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-white/20 mt-6">
                                    <button onClick={() => setShowModal(false)} className="flex-1 btn-skeuo py-2">Cancel</button>
                                    <button onClick={handleSave} className="flex-1 btn-skeuo-primary py-2">Save Plan</button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

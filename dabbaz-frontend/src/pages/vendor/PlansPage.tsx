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
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Subscription Plans</h1>
                <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700">
                    Create New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <p className="text-sm text-gray-500">{plan.duration_days} Days · {plan.meal_type} · {plan.food_type}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {plan.is_active ? 'Active' : 'Paused'}
                            </span>
                        </div>
                        <div className="text-xl font-bold">₹{plan.price}</div>
                        <div className="flex gap-2 pt-4 border-t">
                            <button onClick={() => openModal(plan)} className="flex-1 border rounded py-1 text-sm font-medium hover:bg-gray-50">Edit</button>
                            <button onClick={() => handleToggle(plan.id)} className="flex-1 border rounded py-1 text-sm font-medium hover:bg-gray-50">
                                {plan.is_active ? 'Pause' : 'Activate'}
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="flex-1 border border-red-200 text-red-600 rounded py-1 text-sm font-medium hover:bg-red-50">Delete</button>
                        </div>
                    </div>
                ))}
                {plans.length === 0 && <p className="text-gray-500">No plans created yet.</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Plan' : 'Create Plan'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Plan Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekly Dabba" className="mt-1 w-full border rounded p-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Duration (Days)</label>
                                    <input type="number" min="4" value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Price (INR)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full border rounded p-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Meal Type</label>
                                    <select value={mealType} onChange={e => setMealType(e.target.value)} className="mt-1 w-full border rounded p-2">
                                        <option value="LUNCH">Lunch Only</option>
                                        <option value="DINNER">Dinner Only</option>
                                        <option value="BOTH">Lunch + Dinner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Food Type</label>
                                    <select value={foodType} onChange={e => setFoodType(e.target.value)} className="mt-1 w-full border rounded p-2">
                                        <option value="VEG">Vegetarian</option>
                                        <option value="NONVEG">Non-Vegetarian</option>
                                        <option value="BOTH">Mix</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="autoRenew" checked={autoRenewal} onChange={e => setAutoRenewal(e.target.checked)} />
                                <label htmlFor="autoRenew" className="text-sm">Enable auto-renewal by default</label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 border rounded p-2 hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSave} className="flex-1 bg-green-600 text-white rounded p-2 hover:bg-green-700">Save Plan</button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

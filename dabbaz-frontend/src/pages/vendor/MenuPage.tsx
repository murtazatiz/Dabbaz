import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';
import api from '../../lib/api';

interface MenuItem {
    id: number;
    date: string;
    meal_type: string;
    name: string;
    description: string;
    food_type: string;
    is_off_day: boolean;
    is_slot_disabled: boolean;
}

export default function MenuPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'LUNCH' | 'DINNER'>('LUNCH');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Form states
    const [editingId, setEditingId] = useState<number | null>(null);
    const [mealName, setMealName] = useState('');
    const [description, setDescription] = useState('');
    const [foodType, setFoodType] = useState('VEG');

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday Start

    const fetchMenu = async (date: Date) => {
        try {
            const formattedDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const res = await api.get(`/vendors/menu?week=${formattedDate}`);
            setMenuItems(res.data.items);
        } catch {
            console.error("Failed to load menu");
        }
    };

    useEffect(() => {
        fetchMenu(currentDate);
    }, [currentDate]);

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    const openAddModal = (date: Date, item?: MenuItem) => {
        setSelectedDate(date);
        if (item) {
            setEditingId(item.id);
            setMealName(item.name);
            setDescription(item.description || '');
            setFoodType(item.food_type);
        } else {
            setEditingId(null);
            setMealName('');
            setDescription('');
            setFoodType('VEG');
        }
        setShowModal(true);
    };

    const handleSaveMeal = async () => {
        try {
            if (editingId) {
                await api.patch(`/vendors/menu/${editingId}`, {
                    name: mealName,
                    description,
                    food_type: foodType,
                });
            } else {
                await api.post(`/vendors/menu`, {
                    date: format(selectedDate!, 'yyyy-MM-dd'),
                    meal_type: activeTab,
                    name: mealName,
                    description,
                    food_type: foodType,
                });
            }
            setShowModal(false);
            fetchMenu(currentDate);
        } catch {
            alert("Failed to save meal");
        }
    };

    const toggleOffDay = async (id: number) => {
        try {
            await api.patch(`/vendors/menu/${id}/off-day`);
            fetchMenu(currentDate);
        } catch {
            alert("Failed to update");
        }
    };

    const toggleSlotDisable = async (id: number) => {
        try {
            await api.patch(`/vendors/menu/${id}/disable-slot`);
            fetchMenu(currentDate);
        } catch {
            alert("Failed to update");
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Weekly Menu Builder</h1>
                <div className="flex items-center gap-4 bg-white p-2 rounded shadow">
                    <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-100 rounded">&larr;</button>
                    <span className="font-medium">
                        {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                    </span>
                    <button onClick={handleNextWeek} className="p-1 hover:bg-gray-100 rounded">&rarr;</button>
                </div>
            </div>

            <div className="mb-4 space-x-2">
                <button
                    onClick={() => setActiveTab('LUNCH')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'LUNCH' ? 'bg-white text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    LUNCH
                </button>
                <button
                    onClick={() => setActiveTab('DINNER')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'DINNER' ? 'bg-white text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    DINNER
                </button>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    // Mock matching since true DB schema connects on actual ISO strings
                    const item = menuItems.find(m => m.date.startsWith(dateStr) && m.meal_type === activeTab);

                    return (
                        <div key={day.toISOString()} className="bg-white border rounded p-4 shadow-sm min-h-[200px] flex flex-col relative">
                            <div className="text-center font-medium border-b pb-2 mb-2 text-gray-700">
                                {format(day, 'EEE do')}
                            </div>

                            {item?.is_off_day ? (
                                <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                                    <span className="text-sm font-medium">Day Off</span>
                                    <button onClick={() => toggleOffDay(item.id)} className="text-xs text-blue-500 underline mt-2">Undo</button>
                                </div>
                            ) : item?.is_slot_disabled ? (
                                <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                                    <span className="text-sm font-medium">Slot Disabled</span>
                                    <button onClick={() => toggleSlotDisable(item.id)} className="text-xs text-blue-500 underline mt-2">Undo</button>
                                </div>
                            ) : item ? (
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold text-gray-900">{item.name}</span>
                                            <span className={`text-[10px] px-1 rounded text-white ${item.food_type === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}>{item.food_type}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-3">{item.description}</p>
                                    </div>

                                    <div className="mt-4 space-y-1">
                                        <button onClick={() => openAddModal(day, item)} className="w-full text-xs border rounded p-1 hover:bg-gray-50 text-gray-600">Edit Meal</button>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleSlotDisable(item.id)} className="flex-1 text-[10px] bg-yellow-50 text-yellow-700 rounded p-1">Disable Slot</button>
                                            <button onClick={() => toggleOffDay(item.id)} className="flex-1 text-[10px] bg-red-50 text-red-700 rounded p-1">Day Off</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <button onClick={() => openAddModal(day)} className="text-sm text-green-600 hover:text-green-700 font-medium">
                                        + Add Meal
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                    <div className="w-96 bg-white h-full shadow-lg p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Meal' : 'Add Meal'} for {format(selectedDate!, 'MMM d')}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Meal Name</label>
                                <input value={mealName} onChange={e => setMealName(e.target.value)} className="w-full border rounded p-2 mt-1" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={120} className="w-full border rounded p-2 mt-1 h-24" />
                                <span className="text-xs text-gray-400">{120 - description.length} chars remaining</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Food Type</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-1"><input type="radio" checked={foodType === 'VEG'} onChange={() => setFoodType('VEG')} /> Veg</label>
                                    <label className="flex items-center gap-1"><input type="radio" checked={foodType === 'NONVEG'} onChange={() => setFoodType('NONVEG')} /> Non-Veg</label>
                                </div>
                            </div>

                            {/* Addons mock UI */}
                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-2">Available Addons</p>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Extra Roti x2 (₹20, Veg)</label>
                            </div>

                        </div>

                        <div className="mt-8 flex gap-2">
                            <button onClick={handleSaveMeal} className="flex-1 bg-green-600 text-white rounded p-2">Save</button>
                            <button onClick={() => setShowModal(false)} className="flex-1 border rounded p-2 bg-gray-50 text-gray-700">Cancel</button>
                        </div>

                        {editingId && (
                            <button className="w-full mt-2 text-red-500 text-sm border border-red-500 rounded p-2">Delete Meal</button>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

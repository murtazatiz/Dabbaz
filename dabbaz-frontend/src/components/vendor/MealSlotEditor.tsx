import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';

interface MealSlotEditorProps {
    date: Date;
    mealType: 'LUNCH' | 'DINNER';
    existingItem?: any;
    onClose: () => void;
    onSaveSuccess: () => void;
}

export default function MealSlotEditor({ date, mealType, existingItem, onClose, onSaveSuccess }: MealSlotEditorProps) {
    const [name, setName] = useState(existingItem?.name || '');
    const [description, setDescription] = useState(existingItem?.description || '');
    const [foodType, setFoodType] = useState(existingItem?.food_type || 'VEG');
    const [fulfilmentTypes, setFulfilmentTypes] = useState(existingItem?.fulfilment_types || 'DELIVERY');
    const [maxOrders, setMaxOrders] = useState<number | ''>(existingItem?.max_orders ?? '');
    const [maxPortions, setMaxPortions] = useState<number | ''>(existingItem?.max_portions ?? '');

    // Addons state
    const [libraryAddons, setLibraryAddons] = useState<any[]>([]);
    // selected state maps libraryAddonId -> { selected: boolean, price: number | '' }
    const [addonState, setAddonState] = useState<Record<number, { selected: boolean, price: number | '' }>>({});

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const res = await api.get('/vendors/addons');
                setLibraryAddons(res.data.addons);

                // Initialize selected state
                const initial: Record<number, { selected: boolean, price: number | '' }> = {};
                res.data.addons.forEach((a: any) => {
                    // Check if existingItem has this addon attached
                    const attached = existingItem?.MenuItemAddon?.find((mia: any) => mia.addon.id === a.id);
                    if (attached) {
                        initial[a.id] = { selected: true, price: Number(attached.price) };
                    } else {
                        initial[a.id] = { selected: false, price: '' };
                    }
                });
                setAddonState(initial);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLibrary();
    }, [existingItem]);

    const handleToggleAddon = (id: number) => {
        setAddonState(prev => ({
            ...prev,
            [id]: { ...prev[id], selected: !prev[id].selected }
        }));
    };

    const handleAddonPriceChange = (id: number, val: string) => {
        setAddonState(prev => ({
            ...prev,
            [id]: { ...prev[id], price: val === '' ? '' : Number(val) }
        }));
    };

    const handleSave = async () => {
        try {
            const payload: any = {
                name,
                description,
                food_type: foodType,
                fulfilment_types: fulfilmentTypes,
                max_orders: maxOrders === '' ? null : maxOrders,
                max_portions: maxPortions === '' ? null : maxPortions
            };

            let savedItemId = existingItem?.id;

            if (existingItem) {
                await api.patch(`/vendors/menu/${existingItem.id}`, payload);
            } else {
                const res = await api.post(`/vendors/menu`, {
                    date: format(date, 'yyyy-MM-dd'),
                    meal_type: mealType,
                    ...payload
                });
                savedItemId = res.data.item.id;
            }

            // Sync Addons
            const targetAttachedIds = Object.keys(addonState).map(Number).filter(id => addonState[id].selected);
            const targetAddons = targetAttachedIds.map(id => ({
                addonId: id,
                price: addonState[id].price
            }));

            await api.post(`/vendors/menu/${savedItemId}/addons`, { addons: targetAddons });

            onSaveSuccess();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error ? `\nServer Error: ${err.response.data.error}` : '';
            alert((err.response?.data?.message || 'Failed to save meal') + errorMsg);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this meal?")) return;
        try {
            await api.delete(`/vendors/menu/${existingItem.id}`);
            onSaveSuccess();
        } catch {
            alert("Failed to delete");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-lg glass-modal flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-white/40">
                    <div>
                        <h2 className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{existingItem ? 'Edit Meal' : 'Add Meal'}</h2>
                        <p className="text-sm font-medium text-text-secondary mt-1">{format(date, 'MMM d, yyyy')} • {mealType}</p>
                    </div>
                    <button onClick={onClose} className="p-2 btn-skeuo rounded-full text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Meal Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="input-neumorphic" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={180} className="input-neumorphic h-24 resize-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-primary mb-3">Food Type</label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer"><input type="radio" className="skeuo-radio" checked={foodType === 'VEG'} onChange={() => setFoodType('VEG')} /> <span className="font-medium text-text-primary">Veg</span></label>
                            <label className="flex items-center gap-3 cursor-pointer"><input type="radio" className="skeuo-radio" checked={foodType === 'NONVEG'} onChange={() => setFoodType('NONVEG')} /> <span className="font-medium text-text-primary">Non-Veg</span></label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/40">
                        <label className="block text-sm font-bold text-text-primary mb-3">Available Add-ons for this slot</label>
                        {libraryAddons.length === 0 ? (
                            <p className="text-sm text-text-secondary italic">No add-ons in your library. Add some from Vendor Settings.</p>
                        ) : (
                            <div className="space-y-3">
                                {libraryAddons.map(addon => {
                                    const st = addonState[addon.id] || { selected: false, price: '' };
                                    return (
                                        <div key={addon.id} className="flex flex-wrap items-center gap-4 bg-brand-base/40 p-3 rounded-xl border border-white/30">
                                            <input
                                                type="checkbox"
                                                checked={st.selected}
                                                onChange={() => handleToggleAddon(addon.id)}
                                                className="skeuo-checkbox"
                                            />
                                            <span className="flex-1 text-sm font-bold text-text-primary">{addon.name}</span>
                                            {st.selected && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-text-secondary">₹</span>
                                                    <input
                                                        type="number"
                                                        value={st.price}
                                                        onChange={e => handleAddonPriceChange(addon.id, e.target.value)}
                                                        className="input-neumorphic py-1.5 px-3 w-24 text-sm font-bold"
                                                        placeholder="Price"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/40">
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Max Orders</label>
                            <input type="number" min="1" value={maxOrders} onChange={e => setMaxOrders(e.target.value === '' ? '' : Number(e.target.value))} className="input-neumorphic" placeholder="Unlimited" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-primary mb-2">Max Portions</label>
                            <input type="number" min="1" value={maxPortions} onChange={e => setMaxPortions(e.target.value === '' ? '' : Number(e.target.value))} className="input-neumorphic" placeholder="Unlimited" />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/40 flex gap-4 shrink-0 bg-brand-base/30 rounded-b-[28px]">
                    <button onClick={handleSave} className="flex-1 btn-skeuo-primary p-4 text-base font-bold flex justify-center items-center">
                        <Check size={20} className="mr-2" /> Save Meal
                    </button>
                    {existingItem && (
                        <button onClick={handleDelete} className="px-6 btn-skeuo text-error font-bold whitespace-nowrap">
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

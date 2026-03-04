import { useState } from 'react';
import { Edit2, CheckCircle2, Circle } from 'lucide-react';

interface MealCardProps {
    item: any;
    isVendor: boolean;
    onEdit?: () => void;
    onToggleStatus?: () => void;
    onAddToCart?: (selectedAddons: number[], totalPrice: number) => void;
}

export default function MealCard({ item, isVendor, onEdit, onToggleStatus, onAddToCart }: MealCardProps) {
    const basePrice = 180;
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

    const addons = item.MenuItemAddon || [];
    const hasAddons = addons.length > 0;

    const toggleAddon = (addonId: number) => {
        if (isVendor) return; // vendor can't interact
        setSelectedAddons(prev =>
            prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
        );
    };

    const addonsTotal = selectedAddons.reduce((sum, id) => {
        const addon = addons.find((a: any) => a.addon.id === id);
        return sum + (addon ? Number(addon.price) : 0);
    }, 0);

    const totalPrice = basePrice + addonsTotal;

    const handleAddToCartClick = () => {
        if (onAddToCart) onAddToCart(selectedAddons, totalPrice);
    };

    return (
        <div className="card-neumorphic overflow-hidden w-full p-0 flex flex-col transition-all">
            {/* Photo */}
            <div className="w-full h-44 bg-brand-primary/10 relative border-b-2 border-brand-primary/10">
                {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover shadow-[0_4px_10px_rgba(180,130,90,0.15)] relative z-10" />
                ) : (
                    <div className="w-full h-full opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wLDBIMTBWMTBIMHoiIGZpbGw9IiNGRkUiIC8+CjxwYXRoIGQ9Ik0wLDEwaDEwdjEwSDB6IiBmaWxsPSIjRjZGNkY2IiAvPgo8cGF0aCBkPSJNMTAsMGgxMHYxMEgxMHoiIGZpbGw9IiNGNkY2RjYiIC8+CjxwYXRoIGQ9Ik0xMCwxMGgxMHYxMEgxMHoiIGZpbGw9IiNGRkUiIC8+Cjwvc3ZnPg==')" }}></div>
                )}
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {item.name}
                            </h3>
                            <span className={`flex items-center gap-1 ${item.food_type === 'VEG' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'} px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide inset-shadow-sm`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.food_type === 'VEG' ? 'bg-success' : 'bg-error'}`}></span>
                                {item.food_type === 'VEG' ? 'VEG' : 'NON-VEG'}
                            </span>

                            {isVendor && (
                                <button
                                    onClick={onToggleStatus}
                                    className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors pointer-events-none ${item.status === 'PUBLISHED' ? 'bg-success/20 text-success' : 'bg-brand-primary/20 text-brand-primary'
                                        }`}
                                >
                                    {item.status}
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                            {item.description || "No description provided."}
                        </p>
                    </div>

                    {isVendor && (
                        <button onClick={onEdit} className="btn-skeuo p-2.5 rounded-full text-text-secondary hover:text-brand-primary ml-4 shrink-0 focus:outline-none">
                            <Edit2 size={18} />
                        </button>
                    )}
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-brand-primary">₹{basePrice}</span>
                    {!isVendor && addonsTotal > 0 && (
                        <span className="text-sm font-bold text-text-secondary">+ ₹{addonsTotal} add-ons</span>
                    )}
                </div>
            </div>

            {/* Add-ons */}
            {hasAddons && (
                <div className="border-t border-brand-primary/10 px-6 py-5 bg-brand-base/40">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">Add-ons</h4>
                    <div className="space-y-3">
                        {addons.map((menuItemAddon: any) => {
                            const isSelected = selectedAddons.includes(menuItemAddon.addon.id);
                            return (
                                <div
                                    key={menuItemAddon.addon.id}
                                    onClick={() => toggleAddon(menuItemAddon.addon.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${!isVendor ? 'cursor-pointer' : ''} ${isSelected ? 'bg-brand-primary/10 shadow-inner' : 'hover:bg-brand-primary/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {!isVendor ? (
                                            isSelected ? <CheckCircle2 size={20} className="text-brand-primary" /> : <Circle size={20} className="text-text-secondary/50" />
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/50 ml-1"></span>
                                        )}
                                        <span className="text-sm text-text-primary font-bold">{menuItemAddon.addon.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-brand-primary">+₹{menuItemAddon.price}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Action Area */}
            <div className="p-6 border-t border-brand-primary/10">
                {isVendor ? (
                    <p className="text-xs text-center text-text-secondary italic">This is exactly what your customers see</p>
                ) : (
                    <button
                        onClick={handleAddToCartClick}
                        className="btn-skeuo-primary w-full py-4 px-5 text-lg flex justify-between items-center"
                    >
                        <span>Add to Cart</span>
                        <span>₹{totalPrice}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X, Sun, Moon } from 'lucide-react';
import MealCard from './MealCard';

interface DayModalProps {
    date: Date;
    lunchItem: any;
    dinnerItem: any;
    isVendor: boolean;
    onClose: () => void;
    onEditMeal: (date: Date, mealType: string, item?: any) => void;
    onToggleStatus: (id: number) => void;
    onAddToCart: (item: any, selectedAddons: number[], totalPrice: number) => void;
}

export default function DayModal({ date, lunchItem, dinnerItem, isVendor, onClose, onEditMeal, onToggleStatus, onAddToCart }: DayModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 250);
    };

    const showLunch = lunchItem && (isVendor || lunchItem.status === 'PUBLISHED');
    const showDinner = dinnerItem && (isVendor || dinnerItem.status === 'PUBLISHED');

    // Vendor empty states
    const renderEmptyState = (mealType: 'LUNCH' | 'DINNER') => (
        <div className="border-2 border-dashed border-brand-primary/20 rounded-2xl p-6 text-center bg-brand-base/30">
            <button
                onClick={() => onEditMeal(date, mealType)}
                className="btn-skeuo-primary px-5 py-2 text-sm"
            >
                + Add {mealType === 'LUNCH' ? 'Lunch' : 'Dinner'}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div
                className={`relative w-full max-w-[560px] max-h-[90vh] glass-modal sm:rounded-3xl rounded-t-3xl sm:rounded-t-3xl flex flex-col transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:top-auto top-auto bottom-0 sm:bottom-auto fixed sm:relative ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}
            >
                <div className="px-6 py-5 flex justify-between items-start shrink-0">
                    <div>
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{format(date, 'EEEE')}</h4>
                        <h2 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {format(date, 'd MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {isVendor && !lunchItem && !dinnerItem && (
                            <button onClick={() => onEditMeal(date, 'LUNCH')} className="btn-skeuo-primary px-4 py-2 text-sm hidden sm:block">
                                + Add Meal
                            </button>
                        )}
                        <button onClick={handleClose} className="p-2 btn-skeuo rounded-full flex items-center justify-center text-text-secondary">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-8">

                    {(!isVendor && !showLunch && !showDinner) && (
                        <div className="text-center py-12 text-gray-400 italic font-medium">
                            Nothing available on this day yet.
                        </div>
                    )}

                    {(isVendor || showLunch) && (
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center gap-1.5 shrink-0">
                                    <Sun size={16} className="text-amber-500" /> LUNCH
                                </h3>
                                <span className="text-xs text-gray-400 shrink-0">· 12:00 – 1:00 PM</span>
                                {isVendor && lunchItem && lunchItem.status === 'DRAFT' && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">DRAFT</span>
                                )}
                                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-2"></div>
                            </div>

                            {lunchItem ? (
                                <MealCard
                                    item={lunchItem}
                                    isVendor={isVendor}
                                    onEdit={() => onEditMeal(date, 'LUNCH', lunchItem)}
                                    onToggleStatus={() => onToggleStatus(lunchItem.id)}
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    onAddToCart={(addons, _price) => onAddToCart(lunchItem, addons, _price)}
                                />
                            ) : (
                                isVendor && renderEmptyState('LUNCH')
                            )}
                        </section>
                    )}

                    {(isVendor || showDinner) && (
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center gap-1.5 shrink-0">
                                    <Moon size={16} className="text-indigo-500" /> DINNER
                                </h3>
                                <span className="text-xs text-gray-400 shrink-0">· 7:30 – 8:30 PM</span>
                                {isVendor && dinnerItem && dinnerItem.status === 'DRAFT' && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">DRAFT</span>
                                )}
                                <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-2"></div>
                            </div>

                            {dinnerItem ? (
                                <MealCard
                                    item={dinnerItem}
                                    isVendor={isVendor}
                                    onEdit={() => onEditMeal(date, 'DINNER', dinnerItem)}
                                    onToggleStatus={() => onToggleStatus(dinnerItem.id)}
                                    onAddToCart={(addons, price) => onAddToCart(dinnerItem, addons, price)}
                                />
                            ) : (
                                isVendor && renderEmptyState('DINNER')
                            )}
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
}

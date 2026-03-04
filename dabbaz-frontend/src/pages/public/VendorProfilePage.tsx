import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import api from '../../lib/api';
import { useCart } from '../../store/cart.store';
import MenuCalendar from '../../components/calendar/MenuCalendar';
import DayModal from '../../components/calendar/DayModal';

export default function VendorProfilePage() {
    const { slug } = useParams();
    const [vendor, setVendor] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const { addToCart } = useCart();
    const [addingItem, setAddingItem] = useState<number | null>(null);

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                const monthStr = format(currentMonth, 'yyyy-MM');
                const [profileRes, menuRes, plansRes] = await Promise.all([
                    api.get(`/vendors/public/${slug}`),
                    api.get(`/vendors/public/${slug}/menu?month=${monthStr}`),
                    api.get(`/vendors/public/${slug}/plans`)
                ]);

                setVendor(profileRes.data.vendor);
                setMenu(menuRes.data.items);
                setPlans(plansRes.data.plans);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load vendor profile", error);
                setLoading(false);
            }
        };
        fetchVendorDetails();
    }, [slug, currentMonth]);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Chef Details...</div>;
    if (!vendor) return <div className="p-12 text-center text-red-500">Chef not found</div>;

    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleAddToCart = async (item: any, selectedAddons: number[], totalPrice: number) => {
        setAddingItem(item.id);
        const dateStr = format(selectedDate!, 'yyyy-MM-dd');
        try {
            await addToCart({
                vendor_id: vendor.id,
                menu_item_id: item.id,
                meal_type: item.meal_type,
                delivery_date: dateStr,
                quantity: 1,
                fulfillment_mode: 'DELIVERY', // default
                addon_ids: selectedAddons, // Add-on array if backend parses it
                price: totalPrice // The total price calculated including addons
            } as any); // Cast as any because the base cart store interface doesn't explicitly type these new addon properties yet
            // If we want a success message or to close
            setSelectedDate(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingItem(null);
        }
    };

    // Derived day state
    let dayLunchItem, dayDinnerItem;
    if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayItems = menu.filter(m => format(new Date(m.date), 'yyyy-MM-dd') === dateStr);
        dayLunchItem = dayItems.find(m => m.meal_type === 'LUNCH');
        dayDinnerItem = dayItems.find(m => m.meal_type === 'DINNER');
    }

    return (
        <div className="bg-brand-base/30 min-h-screen pb-12">
            {/* Cover Profile Header */}
            <div className="bg-brand-base border-b border-brand-primary/10">
                <div className="h-64 md:h-80 w-full bg-brand-primary/10 relative">
                    {vendor.cover_photo_url && (
                        <img src={vendor.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 md:left-12 text-white">
                        <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-2 tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {vendor.business_name}
                            {vendor.is_verified && <span className="text-blue-400 text-2xl" title="FSSAI Verified">✓</span>}
                        </h1>
                        <p className="opacity-90 mt-2 max-w-2xl font-medium">{vendor.about}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap gap-6 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">Food:</span> {vendor.food_type === 'BOTH' ? 'Veg & Non-Veg' : vendor.food_type}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">Rating:</span> ★ 4.8 (120 reviews)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">Delivers to:</span> {JSON.parse(vendor.delivery_pincodes || '[]').length} Areas
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Col: Menu */}
                <div className="flex-1 space-y-8">
                    <MenuCalendar
                        items={menu}
                        currentMonth={currentMonth}
                        onNextMonth={handleNextMonth}
                        onPrevMonth={handlePrevMonth}
                        onDayClick={setSelectedDate}
                        isVendor={false}
                    />
                </div>

                {/* Right Col: Info Sticky */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="sticky top-8 space-y-6">

                        <div className="card-neumorphic">
                            <h2 className="text-xl font-bold mb-4 text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Start Ordering</h2>
                            <p className="text-text-secondary font-medium text-sm mb-6">Build your cart by selecting dates on the calendar. Customize your meals with delicious add-ons.</p>

                            <div className="bg-success/10 rounded-xl p-4 mb-5 shadow-inner inset-shadow-sm border border-success/20">
                                <h4 className="font-bold text-success text-sm mb-1">Minimum 3 Portions</h4>
                                <p className="text-success text-xs font-medium text-balance">To keep deliveries efficient, please ensure you add at least 3 portions from this chef before checking out.</p>
                            </div>

                            <div className="space-y-4 text-sm font-medium text-text-secondary">
                                {vendor.delivery_charge && (
                                    <div className="flex justify-between items-center border-t border-brand-primary/10 pt-4">
                                        <span>Delivery Charge</span>
                                        <span className="font-bold text-text-primary">₹{vendor.delivery_charge} / trip</span>
                                    </div>
                                )}
                                {vendor.collection_enabled && (
                                    <div className="flex justify-between items-center border-t border-brand-primary/10 pt-4">
                                        <span>Self-Pickup</span>
                                        <span className="font-bold text-success">Available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {selectedDate && (
                <DayModal
                    date={selectedDate}
                    lunchItem={dayLunchItem}
                    dinnerItem={dayDinnerItem}
                    isVendor={false}
                    onClose={() => setSelectedDate(null)}
                    onEditMeal={() => { }}
                    onToggleStatus={() => { }}
                    onAddToCart={handleAddToCart}
                />
            )}
        </div>
    );
}

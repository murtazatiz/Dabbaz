import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import api from '../../lib/api';
import MenuCalendar from '../../components/calendar/MenuCalendar';
import DayModal from '../../components/calendar/DayModal';
import MealSlotEditor from '../../components/vendor/MealSlotEditor';

export default function MenuPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Editing State
    const [editingSlot, setEditingSlot] = useState<{ date: Date, mealType: 'LUNCH' | 'DINNER', item?: any } | null>(null);

    const fetchMenu = async (date: Date) => {
        try {
            const formattedMonth = format(date, 'yyyy-MM');
            // Assuming backend accepts `month=YYYY-MM` and returns everything for the month
            const res = await api.get(`/vendors/menu?month=${formattedMonth}`);
            setMenuItems(res.data.items);
        } catch {
            console.error("Failed to load menu");
        }
    };

    useEffect(() => {
        fetchMenu(currentMonth);
    }, [currentMonth]);

    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const toggleStatus = async (id: number) => {
        try {
            await api.patch(`/vendors/menu/${id}/status`);
            fetchMenu(currentMonth);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error ? `\nServer Error: ${err.response.data.error}` : '';
            alert("Failed to toggle status" + errorMsg);
        }
    };

    // Derived day state
    let dayLunchItem, dayDinnerItem;
    if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayItems = menuItems.filter(m => format(new Date(m.date), 'yyyy-MM-dd') === dateStr);
        dayLunchItem = dayItems.find(m => m.meal_type === 'LUNCH');
        dayDinnerItem = dayItems.find(m => m.meal_type === 'DINNER');
    }

    return (
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-[98%] mx-auto py-8 px-4">
                <MenuCalendar
                    items={menuItems}
                    currentMonth={currentMonth}
                    onNextMonth={handleNextMonth}
                    onPrevMonth={handlePrevMonth}
                    onDayClick={setSelectedDate}
                    isVendor={true}
                />

                {selectedDate && (
                    <DayModal
                        date={selectedDate}
                        lunchItem={dayLunchItem}
                        dinnerItem={dayDinnerItem}
                        isVendor={true}
                        onClose={() => setSelectedDate(null)}
                        onEditMeal={(d, type, item) => setEditingSlot({ date: d, mealType: type as any, item })}
                        onToggleStatus={toggleStatus}
                        onAddToCart={() => { }}
                    />
                )}

                {editingSlot && (
                    <MealSlotEditor
                        date={editingSlot.date}
                        mealType={editingSlot.mealType}
                        existingItem={editingSlot.item}
                        onClose={() => setEditingSlot(null)}
                        onSaveSuccess={() => {
                            setEditingSlot(null);
                            fetchMenu(currentMonth);
                        }}
                    />
                )}
            </div>
        </div>
    );
}


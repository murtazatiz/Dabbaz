import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarDayCell from './CalendarDayCell';

interface MenuCalendarProps {
    items: any[];
    currentMonth: Date;
    onNextMonth: () => void;
    onPrevMonth: () => void;
    onDayClick: (day: Date) => void;
    isVendor: boolean;
}

export default function MenuCalendar({ items, currentMonth, onNextMonth, onPrevMonth, onDayClick, isVendor }: MenuCalendarProps) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "yyyy-MM-dd";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-center gap-6 mb-6">
                <button onClick={onPrevMonth} className="p-2 btn-skeuo rounded-full flex items-center justify-center">
                    <ChevronLeft size={24} className="text-text-primary" />
                </button>
                <h2 className="text-2xl font-normal text-text-primary whitespace-nowrap min-w-[250px] text-center">
                    {format(monthStart, 'MMMM, yyyy')}
                </h2>
                <button onClick={onNextMonth} className="p-2 btn-skeuo rounded-full flex items-center justify-center">
                    <ChevronRight size={24} className="text-text-primary" />
                </button>
            </div>

            {/* Grid */}
            <div className="card-neumorphic p-0 overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-brand-primary/10 bg-brand-base/40">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-xl font-bold text-gray-500 tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(90px,12vh)]">
                    {days.map((day, idx) => {
                        const dayStr = format(day, dateFormat);
                        const dayItems = items.filter(item => {
                            try {
                                return format(new Date(item.date), dateFormat) === dayStr;
                            } catch (e) {
                                return item.date.startsWith(dayStr);
                            }
                        });

                        const lunchItem = dayItems.find(i => i.meal_type === 'LUNCH');
                        const dinnerItem = dayItems.find(i => i.meal_type === 'DINNER');

                        const isPast = isBefore(day, startOfDay(new Date()));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isDayToday = isToday(day);

                        return (
                            <CalendarDayCell
                                key={day.toString()}
                                date={day}
                                isCurrentMonth={isCurrentMonth}
                                isPast={isPast}
                                isToday={isDayToday}
                                lunchItem={lunchItem}
                                dinnerItem={dinnerItem}
                                isVendor={isVendor}
                                onClick={() => onDayClick(day)}
                                isLastRow={idx >= days.length - 7}
                                isLastCol={(idx + 1) % 7 === 0}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

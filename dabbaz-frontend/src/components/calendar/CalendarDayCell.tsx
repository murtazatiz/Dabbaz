import { format } from 'date-fns';

interface CalendarDayCellProps {
    date: Date;
    isCurrentMonth: boolean;
    isPast: boolean;
    isToday: boolean;
    lunchItem?: any;
    dinnerItem?: any;
    isVendor: boolean;
    onClick: () => void;
    isLastRow: boolean;
    isLastCol: boolean;
}

export default function CalendarDayCell({
    date, isCurrentMonth, isPast, isToday, lunchItem, dinnerItem, isVendor, onClick, isLastRow, isLastCol
}: CalendarDayCellProps) {

    // Evaluate whether to show chips based on vendor/customer rules
    const showLunch = lunchItem && (isVendor || lunchItem.status === 'PUBLISHED');
    const showDinner = dinnerItem && (isVendor || dinnerItem.status === 'PUBLISHED');

    const getChipColor = (item: any) => {
        if (!item) return 'bg-gray-100 text-gray-500';
        if (item.status === 'PUBLISHED') return 'bg-green-100 text-green-700';
        return 'bg-amber-100 text-amber-700';
    };

    const getChipDot = (item: any) => {
        if (!item) return 'bg-gray-400';
        if (item.status === 'PUBLISHED') return 'bg-green-500';
        return 'bg-amber-500';
    };

    // Description text comes from the first available item shown
    let previewText = '';
    if (showLunch && lunchItem.description) previewText = lunchItem.description;
    else if (showDinner && dinnerItem.description) previewText = dinnerItem.description;

    return (
        <div
            onClick={onClick}
            className={`
                relative p-2 flex flex-col cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-brand-base/50 opacity-40' : 'bg-transparent hover:bg-brand-primary/5'}
                ${isPast ? 'opacity-70 grayscale-[30%]' : ''}
                ${!isLastRow ? 'border-b border-brand-primary/10' : ''}
                ${!isLastCol ? 'border-r border-brand-primary/10' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-0.5">
                <span className={`
                    text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-brand-primary text-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4),2px_2px_4px_rgba(180,130,90,0.3)]' : 'text-text-primary'}
                `}>
                    {format(date, 'd')}
                </span>
            </div>

            <div className="flex flex-col gap-1 flex-1 mt-1 pb-1">
                {isVendor && !showLunch && !showDinner && (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1.5 w-max leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Lunch
                        </span>
                        <span className="text-sm bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1.5 w-max leading-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Dinner
                        </span>
                    </div>
                )}

                {(showLunch || showDinner) && (
                    <div className="flex flex-col gap-0.5">
                        {showLunch && (
                            <span className={`text-sm leading-none px-2 py-0.5 rounded-full flex items-center gap-1.5 font-medium w-max ${getChipColor(lunchItem)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getChipDot(lunchItem)}`}></span>
                                Lunch
                            </span>
                        )}
                        {showDinner && (
                            <span className={`text-sm leading-none px-2 py-0.5 rounded-full flex items-center gap-1.5 font-medium w-max ${getChipColor(dinnerItem)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getChipDot(dinnerItem)}`}></span>
                                Dinner
                            </span>
                        )}
                    </div>
                )}

                {previewText && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-tight opacity-80 pb-0.5">
                        {previewText}
                    </p>
                )}
            </div>
        </div>
    );
}

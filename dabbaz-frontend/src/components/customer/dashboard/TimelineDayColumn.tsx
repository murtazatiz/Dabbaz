import React from 'react';
import { format, isToday } from 'date-fns';

interface DayData {
    date: string;
    hasOrders: boolean;
    orderCount: number;
}

interface Props {
    dayData: DayData;
    isSelected: boolean;
    onSelect: (date: string) => void;
    onBrowse: () => void;
}

const TimelineDayColumn: React.FC<Props> = ({ dayData, isSelected, onSelect, onBrowse }) => {
    const dateObj = new Date(dayData.date);
    const dayAbbrev = format(dateObj, 'EEE');
    const dateNum = format(dateObj, 'd');
    const today = isToday(dateObj);

    return (
        <div
            className={`
                shrink-0 w-[56px] h-[92px] rounded-xl flex flex-col items-center justify-center relative cursor-pointer
                transition-all duration-200 border-2
                ${isSelected ? 'bg-[#FFF0EB] border-[#FFF0EB]' : 'bg-white border-white hover:bg-gray-50'}
                ${today && !isSelected ? 'border-brand-primary' : ''}
                ${today && isSelected ? 'border-brand-primary' : ''}
            `}
            onClick={() => onSelect(dayData.date)}
            style={{
                scrollSnapAlign: 'center',
                boxShadow: isSelected ? 'inset 0 2px 4px rgba(180,130,90,0.1)' : '0 2px 6px rgba(0,0,0,0.03)'
            }}
        >
            <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isSelected || today ? 'text-brand-secondary' : 'text-gray-400'}`}>
                {dayAbbrev}
            </span>
            <span className={`text-xl font-extrabold pb-2 ${isSelected || today ? 'text-gray-900' : 'text-gray-600'}`}>
                {dateNum}
            </span>

            {/* Indicator Dot / Browse Chip */}
            <div className="absolute bottom-2 flex justify-center w-full">
                {dayData.hasOrders ? (
                    <div className="w-2 h-2 rounded-full bg-green-600 shadow-sm" />
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBrowse();
                        }}
                        className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} transition-colors`}
                    >
                        Browse
                    </button>
                )}
            </div>
        </div>
    );
};

export default TimelineDayColumn;

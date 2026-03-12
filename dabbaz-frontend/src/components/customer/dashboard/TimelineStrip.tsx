import React, { useEffect, useRef } from 'react';
import TimelineDayColumn from './TimelineDayColumn';
import { useNavigate } from 'react-router-dom';

interface DayData {
    date: string;
    hasOrders: boolean;
    orderCount: number;
}

interface Props {
    days: DayData[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
}

const TimelineStrip: React.FC<Props> = ({ days, selectedDate, onSelectDate }) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initial scroll slight offset trick if needed or just let it snap to Today
    useEffect(() => {
        if (scrollContainerRef.current) {
            // Find today element to bring into view if needed
            // Actually it's just 7 days, so it fits mostly on desktop. On mobile, today is first, so it's already in view.
        }
    }, [days]);

    return (
        <div className="w-full mt-4 mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-3 px-1 uppercase tracking-wider">This Week</h3>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 px-1"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {days.map(day => (
                    <TimelineDayColumn
                        key={day.date}
                        dayData={day}
                        isSelected={day.date === selectedDate}
                        onSelect={onSelectDate}
                        onBrowse={() => navigate('/browse')}
                    />
                ))}
            </div>
        </div>
    );
};

export default TimelineStrip;

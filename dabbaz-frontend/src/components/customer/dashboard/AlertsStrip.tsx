import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Wallet, CalendarClock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface AlertData {
    id: string;
    type: 'ORDER_CONFIRMED' | 'ORDER_CANCELLED' | 'WALLET_CREDIT' | 'UPCOMING_REMINDER';
    message: string;
    createdAt: string | null;
}

interface Props {
    alerts: AlertData[];
}

const getStyles = (type: string) => {
    switch (type) {
        case 'ORDER_CONFIRMED': return { border: 'border-l-green-600', icon: <CheckCircle className="w-5 h-5 text-green-600" /> };
        case 'ORDER_CANCELLED': return { border: 'border-l-red-600', icon: <XCircle className="w-5 h-5 text-red-600" /> };
        case 'WALLET_CREDIT': return { border: 'border-l-purple-600', icon: <Wallet className="w-5 h-5 text-purple-600" /> };
        case 'UPCOMING_REMINDER': return { border: 'border-l-brand-primary', icon: <CalendarClock className="w-5 h-5 text-brand-primary" /> };
        default: return { border: 'border-l-gray-400', icon: null };
    }
};

const AlertsStrip: React.FC<Props> = ({ alerts }) => {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    const activeAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

    if (activeAlerts.length === 0) return null;

    const visibleAlerts = activeAlerts.slice(0, 4);

    return (
        <div className="w-full mt-6 mb-8 overflow-hidden rounded-[14px]">
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-1" style={{ scrollSnapType: 'x mandatory' }}>
                {visibleAlerts.map(alert => {
                    const styles = getStyles(alert.type);
                    const timeAgo = alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : null;

                    return (
                        <div
                            key={alert.id}
                            className={`flex-none w-[280px] md:w-[320px] bg-white rounded-[12px] shadow-sm border border-gray-100 border-l-4 ${styles.border} p-4 relative group flex gap-3`}
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            <div className="shrink-0 mt-0.5">
                                {styles.icon}
                            </div>
                            <div className="flex-1 pr-6">
                                <p className="text-sm font-medium text-gray-800 leading-snug">{alert.message}</p>
                                {timeAgo && <span className="text-[10px] text-gray-400 mt-2 block">{timeAgo}</span>}
                            </div>
                            <button
                                onClick={() => {
                                    const newSet = new Set(dismissedAlerts);
                                    newSet.add(alert.id);
                                    setDismissedAlerts(newSet);
                                }}
                                className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors p-1"
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
                {activeAlerts.length > 4 && (
                    <div className="flex-none flex items-center justify-center w-[120px]">
                        <button className="text-sm font-semibold text-brand-primary hover:underline">
                            View all
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsStrip;

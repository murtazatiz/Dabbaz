import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../lib/api';
import TodayCard from '../../components/customer/dashboard/TodayCard';
import AlertsStrip from '../../components/customer/dashboard/AlertsStrip';
import TimelineStrip from '../../components/customer/dashboard/TimelineStrip';
import DayDetailPanel from '../../components/customer/dashboard/DayDetailPanel';
import FavouriteVendors from '../../components/customer/dashboard/FavouriteVendors';
import PastOrders from '../../components/customer/dashboard/PastOrders';
import WalletBalanceCard from '../../components/customer/dashboard/WalletBalanceCard';
import { useAuth } from '../../store/auth.store';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // States for all the parts
    const [todayData, setTodayData] = useState<any>(null);
    const [timelineDays, setTimelineDays] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [pastOrdersPage, setPastOrdersPage] = useState(1);
    const [pastOrdersHasMore, setPastOrdersHasMore] = useState(false);
    const [favourites, setFavourites] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDayData, setSelectedDayData] = useState<any>(null);
    const [loadingDay, setLoadingDay] = useState(false);

    useEffect(() => {
        const fetchInitialDashboard = async () => {
            try {
                const [
                    todayRes,
                    timelineRes,
                    alertsRes,
                    pastOrdersRes,
                    favouritesRes,
                    walletRes
                ] = await Promise.all([
                    api.get('/customer/dashboard/today'),
                    api.get('/customer/dashboard/timeline?days=7'),
                    api.get('/customer/dashboard/alerts'),
                    api.get('/customer/dashboard/past-orders?page=1&limit=5'),
                    api.get('/customer/favourites'),
                    api.get('/customer/wallet/balance')
                ]);

                setTodayData(todayRes.data);
                setTimelineDays(timelineRes.data.days);
                setAlerts(alertsRes.data.alerts);

                setPastOrders(pastOrdersRes.data.orders);
                setPastOrdersHasMore(pastOrdersRes.data.page < pastOrdersRes.data.totalPages);

                setFavourites(favouritesRes.data.favourites);
                setWalletBalance(walletRes.data.balance);

                // Initialize selected date data if it's today
                if (selectedDate === todayRes.data.date) {
                    setSelectedDayData(todayRes.data);
                } else {
                    fetchDayData(selectedDate);
                }

                setLoading(false);
            } catch (error) {
                console.error("Dashboard failed to load", error);
                setLoading(false);
            }
        };
        fetchInitialDashboard();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDayData = async (dateStr: string) => {
        setLoadingDay(true);
        try {
            const res = await api.get(`/customer/dashboard/day?date=${dateStr}`);
            setSelectedDayData(res.data);
        } catch (error) {
            console.error("Failed to fetch day data", error);
        } finally {
            setLoadingDay(false);
        }
    };

    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        fetchDayData(date);
    };

    const handleLoadMorePastOrders = async () => {
        const nextPage = pastOrdersPage + 1;
        try {
            const res = await api.get(`/customer/dashboard/past-orders?page=${nextPage}&limit=5`);
            setPastOrders((prev: any) => [...prev, ...res.data.orders] as any);
            setPastOrdersPage(nextPage);
            setPastOrdersHasMore(res.data.page < res.data.totalPages);
        } catch (error) {
            console.error("Failed to load more past orders", error);
        }
    };

    const handleUnfavourite = async (vendorId: number) => {
        try {
            await api.delete(`/customer/favourites/${vendorId}`);
            setFavourites(favourites.filter((f: any) => f.vendorId !== vendorId));
        } catch (error) {
            console.error("Failed to unfavourite", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
            <div className="text-xl font-medium text-brand-primary animate-pulse">Loading your dashboard...</div>
        </div>
    );

    const isSelectedToday = selectedDate === todayData?.date;

    return (
        <div className="bg-[#FFF8F5] min-h-screen pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 mb-10">

                {/* Header Welcome */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.first_name || 'Foodie'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Here is what's cooking for you.</p>
                </div>

                {/* Main Content Area */}

                <AlertsStrip alerts={alerts} />

                <TodayCard todayData={todayData} />

                <TimelineStrip
                    days={timelineDays}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                />

                {!isSelectedToday && (
                    <div className="mt-4 animate-fade-in">
                        {loadingDay ? (
                            <div className="bg-white p-8 rounded-[14px] text-center text-gray-400 font-medium animate-pulse border border-gray-100">
                                Loading details...
                            </div>
                        ) : (
                            <DayDetailPanel dayData={selectedDayData} />
                        )}
                    </div>
                )}

                <FavouriteVendors favourites={favourites} onUnfavourite={handleUnfavourite} />

                <WalletBalanceCard balance={walletBalance} />

                <PastOrders
                    orders={pastOrders}
                    hasMore={pastOrdersHasMore}
                    onLoadMore={handleLoadMorePastOrders}
                    loading={false}
                />

            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeVendors: 0,
        pendingApplications: 0,
        activeSubscriptions: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load stats", error);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Platform Overview</h1>
                <Link to="/admin-queue" className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700">Vendor Approvals Queue</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">Active Vendors</h3>
                    <p className="text-3xl font-bold mt-2">{stats.activeVendors}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold mt-2">{stats.pendingApplications}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm font-medium">Active Subscriptions</h3>
                    <p className="text-3xl font-bold mt-2">{stats.activeSubscriptions}</p>
                </div>
            </div>
        </div>
    );
}

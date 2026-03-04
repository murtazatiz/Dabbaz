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
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Platform Overview</h1>
                    <Link to="/admin-queue" className="btn-skeuo-primary px-6 py-2">Vendor Approvals Queue</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card-neumorphic border-l-4 border-blue-500">
                        <h3 className="text-text-secondary text-sm font-bold">Total Users</h3>
                        <p className="text-3xl font-extrabold mt-2 text-text-primary">{stats.totalUsers}</p>
                    </div>
                    <div className="card-neumorphic border-l-4 border-success">
                        <h3 className="text-text-secondary text-sm font-bold">Active Vendors</h3>
                        <p className="text-3xl font-extrabold mt-2 text-text-primary">{stats.activeVendors}</p>
                    </div>
                    <div className="card-neumorphic border-l-4 border-brand-primary">
                        <h3 className="text-text-secondary text-sm font-bold">Pending Approvals</h3>
                        <p className="text-3xl font-extrabold mt-2 text-text-primary">{stats.pendingApplications}</p>
                    </div>
                    <div className="card-neumorphic border-l-4 border-purple-500">
                        <h3 className="text-text-secondary text-sm font-bold">Active Subscriptions</h3>
                        <p className="text-3xl font-extrabold mt-2 text-text-primary">{stats.activeSubscriptions}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

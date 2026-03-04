import { useState, useEffect } from 'react';
import api from '../../lib/api';

interface OnboardingRequest {
    id: number;
    created_at: string;
    business_name: string;
    contact_name: string;
    pincode: string;
    status: string;
    fssai_doc_url: string;
}

export default function VendorQueuePage() {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);

    useEffect(() => {
        // Fetch pending requests
        const fetchRequests = async () => {
            try {
                const res = await api.get('/admin/vendor-queue');
                setRequests(res.data.requests);
            } catch (error) {
                console.error(error);
            }
        }
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/admin/vendor-queue/${id}/approve`);
            alert('Approved!');
            setRequests(requests.filter(r => r.id !== id));
        } catch {
            alert('Error approving');
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await api.post(`/admin/vendor-queue/${id}/reject`, { rejection_reason: reason });
            alert('Rejected!');
            setRequests(requests.filter(r => r.id !== id));
        } catch {
            alert('Error rejecting');
        }
    };

    return (
        <div className="bg-brand-base min-h-screen">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-extrabold mb-8 text-text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>Pending Vendor Approvals</h1>
                <div className="card-neumorphic overflow-hidden p-0 mb-8">
                    <table className="min-w-full divide-y divide-brand-primary/10">
                        <thead className="bg-brand-primary/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Business</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">PIN</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Docs</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-primary/10 bg-transparent">
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-brand-primary/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-text-primary">{req.business_name}</td>
                                    <td className="px-6 py-4 font-medium text-text-secondary">{req.contact_name}</td>
                                    <td className="px-6 py-4 font-medium text-text-secondary">{req.pincode}</td>
                                    <td className="px-6 py-4">
                                        <a href={req.fssai_doc_url} target="_blank" rel="noreferrer" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline">FSSAI</a>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => handleApprove(req.id)} className="btn-skeuo-primary px-4 py-2 text-sm border-transparent hover:bg-success hover:text-white transition-colors border">Approve</button>
                                        <button onClick={() => handleReject(req.id)} className="btn-skeuo px-4 py-2 text-sm border-error text-error hover:bg-error/10 transition-colors">Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-text-secondary font-medium">No pending requests</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

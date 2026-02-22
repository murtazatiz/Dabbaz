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
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Pending Vendor Approvals</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium">Business</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Contact</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">PIN</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Docs</th>
                            <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4">{req.business_name}</td>
                                <td className="px-6 py-4">{req.contact_name}</td>
                                <td className="px-6 py-4">{req.pincode}</td>
                                <td className="px-6 py-4">
                                    <a href={req.fssai_doc_url} target="_blank" rel="noreferrer" className="text-blue-500 underline">FSSAI</a>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button onClick={() => handleApprove(req.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Approve</button>
                                    <button onClick={() => handleReject(req.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">No pending requests</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import api from '../../lib/api';

export interface Addon {
    id: number;
    name: string;
}

export default function AddonLibrary() {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAddons = async () => {
        try {
            const res = await api.get('/vendors/addons');
            setAddons(res.data.addons);
        } catch (error) {
            console.error('Failed to fetch addons', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddons();
    }, []);

    const handleAdd = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newName.trim()) return;

        try {
            const res = await api.post('/vendors/addons', { name: newName.trim() });
            setAddons([res.data.addon, ...addons]);
            setNewName('');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add addon');
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) return;
        try {
            const res = await api.put(`/vendors/addons/${id}`, { name: editName.trim() });
            setAddons(addons.map(a => (a.id === id ? res.data.addon : a)));
            setEditingId(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update addon');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this addon? This will not affect existing orders but will remove it from the library.')) return;

        try {
            await api.delete(`/vendors/addons/${id}`);
            setAddons(addons.filter(a => a.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete addon');
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading addons...</div>;

    return (
        <div className="space-y-4">
            <div className="mb-4 text-sm text-gray-600 italic">
                Create your reusable add-ons here. You'll set prices per meal slot when editing individual meals.
            </div>

            <div className="space-y-2 max-w-lg">
                {addons.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4">No add-ons created yet.</div>
                ) : (
                    addons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            {editingId === addon.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="flex-1 border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#E8531E]"
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdate(addon.id)} className="text-green-600 p-1 hover:bg-green-100 rounded">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="text-gray-500 p-1 hover:bg-gray-200 rounded">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-700">{addon.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setEditingId(addon.id); setEditName(addon.name); }}
                                            className="text-gray-400 hover:text-[#E8531E] p-1 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addon.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleAdd} className="flex items-center gap-2 max-w-lg mt-4 pt-4 border-t border-gray-100">
                <input
                    type="text"
                    placeholder="e.g. Extra Roti, Gulab Jamun..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8531E]/50"
                />
                <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex items-center justify-center gap-1 bg-[#E8531E] hover:bg-[#C43F0D] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <Plus size={16} />
                    <span>Add</span>
                </button>
            </form>
        </div>
    );
}

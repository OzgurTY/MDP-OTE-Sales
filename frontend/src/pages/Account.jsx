import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Trash2, Save, AlertTriangle } from 'lucide-react';

const Account = () => {
    const { currentUser, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const userId = currentUser?.id;

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (userId) fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`/api/users/${userId}`);
            setFormData(prev => ({
                ...prev,
                name: response.data.name,
                email: response.data.email
            }));
        } catch (error) {
            console.error("Error fetching user", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updates = { name: formData.name, email: formData.email };
            if (formData.password) updates.password = formData.password;

            await axios.put(`/api/users/${userId}`, updates);
            setMessage({ type: 'success', text: 'Profile updated successfully.' });

            // Should verify if email changed to update local user state if needed
            // For now, simple success message
        } catch (error) {
            console.error("Error updating profile", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Email might be in use.' });
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/users/${userId}`);
            logout(); // Clear local state
            navigate('/register');
        } catch (error) {
            console.error("Error deleting account", error);
            setMessage({ type: 'error', text: 'Failed to delete account.' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center">
                <User className="mr-2" size={24} /> My Account
            </h2>

            {/* Profile Update Form */}
            <div className="card-flat p-6 bg-white mb-8 shadow-sm border border-zinc-200 rounded-xl">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wide border-b border-zinc-100 pb-2">Profile Details</h3>

                {message.text && (
                    <div className={`mb-4 px-4 py-3 rounded text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="input-minimal w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="input-minimal w-full"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">New Password (Optional)</label>
                        <input
                            type="password"
                            className="input-minimal w-full"
                            placeholder="Leave blank to keep current"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="btn-primary flex items-center px-4 py-2">
                            <Save size={16} className="mr-2" />
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Session Management */}
            <div className="card-flat p-6 bg-zinc-50 mb-8 border border-zinc-200 rounded-xl">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wide border-b border-zinc-200 pb-2">Session</h3>
                <p className="text-sm text-zinc-500 mb-4">Sign out of your account on this device.</p>
                <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-md text-sm font-medium transition-colors">
                    <LogOut size={16} className="mr-2" /> Sign Out
                </button>
            </div>

            {/* Danger Zone */}
            <div className="card-flat p-6 bg-red-50/30 border border-red-100 rounded-xl">
                <h3 className="text-sm font-semibold text-red-700 mb-4 uppercase tracking-wide flex items-center">
                    <AlertTriangle size={16} className="mr-2" /> Danger Zone
                </h3>

                {!deleteConfirm ? (
                    <div>
                        <p className="text-sm text-zinc-600 mb-4">Deleting your account is permanent and cannot be undone. All your data will be lost.</p>
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                        >
                            <Trash2 size={16} className="mr-2" /> Delete Account
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-4 rounded border border-red-200 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-bold text-red-600 mb-2">Are you absolutely sure?</p>
                        <p className="text-xs text-zinc-500 mb-4">This action will permanently delete your account and remove your access to all data.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
                            >
                                Yes, Delete My Account
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded text-xs font-medium hover:bg-zinc-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;

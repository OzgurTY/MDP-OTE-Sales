import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CompensationSettings = () => {
    const { currentUser } = useAuth();
    const userId = currentUser?.id;

    const [profile, setProfile] = useState({
        userId: userId,
        annualOTE: 0,
        baseSplit: 50,
        variableSplit: 50
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (userId) {
            setProfile(p => ({ ...p, userId }));
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`/api/compensation/${userId}`);
            if (response.data) {
                setProfile(response.data);
            }
        } catch (error) {
            console.error("Error fetching compensation profile", error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/compensation', profile);
            setMessage('Compensation profile updated.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving profile", error);
            setMessage('Failed to save.');
        }
        setLoading(false);
    };

    const handleSplitChange = (e) => {
        const base = parseInt(e.target.value);
        setProfile({ ...profile, baseSplit: base, variableSplit: 100 - base });
    };

    const annualBase = (profile?.annualOTE || 0) * ((profile?.baseSplit || 50) / 100);
    const annualVariable = (profile?.annualOTE || 0) * ((profile?.variableSplit || 50) / 100);

    return (
        <div className="card-flat p-6 bg-zinc-50/50 mb-8">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wide">Compensation Structure</h3>

            {message && (
                <div className="mb-4 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded border border-emerald-100">
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Monthly OTE (₺)</label>
                    <input
                        type="number"
                        className="input-minimal max-w-xs font-mono text-lg"
                        value={profile.annualOTE / 12}
                        onChange={e => setProfile({ ...profile, annualOTE: parseFloat(e.target.value || 0) * 12 })}
                    />
                    <p className="text-xs text-zinc-400 mt-1">Total Target Monthly Compensation (Base + Commission)</p>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-medium text-zinc-700 mb-2">
                        <span>Base Salary: {profile.baseSplit}%</span>
                        <span>Commission: {profile.variableSplit}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={profile.baseSplit}
                        onChange={handleSplitChange}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    />
                    <div className="flex justify-between mt-2 pt-2 border-t border-zinc-200/50">
                        <div className="text-sm font-mono text-zinc-900">₺{(annualBase / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</div>
                        <div className="text-sm font-mono text-zinc-900">₺{(annualVariable / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</div>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center"
                    >
                        <Save size={14} className="mr-2" /> Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompensationSettings;

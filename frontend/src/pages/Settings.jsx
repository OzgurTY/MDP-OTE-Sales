import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import CompensationSettings from '../components/CompensationSettings';

import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
    const { currentUser } = useAuth();
    const [rules, setRules] = useState([]);
    const [newRule, setNewRule] = useState({
        rangeStart: '',
        rangeEnd: '',
        multiplier: ''
    });
    const [loading, setLoading] = useState(true);
    const userId = currentUser?.id;

    useEffect(() => {
        if (userId) fetchRules();
    }, [userId]);

    const fetchRules = async () => {
        try {
            const response = await axios.get(`/api/rules?userId=${userId}`);
            setRules(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching rules", error);
            setLoading(false);
        }
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/rules', {
                ...newRule,
                userId,
                rangeStart: parseFloat(newRule.rangeStart),
                rangeEnd: parseFloat(newRule.rangeEnd),
                multiplier: parseFloat(newRule.multiplier)
            });
            setNewRule({ rangeStart: '', rangeEnd: '', multiplier: '' });
            fetchRules();
        } catch (error) {
            console.error("Error adding rule", error);
        }
    };

    const handleDeleteRule = async (id) => {
        try {
            await axios.delete(`/api/rules/${id}`);
            fetchRules();
        } catch (error) {
            console.error("Error deleting rule", error);
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex justify-center items-end border-b border-zinc-200 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900">Commission Logic</h2>
                    <p className="text-sm text-zinc-500 mt-1">Configure marginal payout tiers for commission calculations.</p>
                </div>
            </div>

            {/* Compensation Profile */}
            <CompensationSettings />

            {/* Add Rule Form */}
            <div className="card-flat p-6 bg-zinc-50/50">
                <form onSubmit={handleAddRule} className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">From (%)</label>
                        <input
                            type="number"
                            className="input-minimal"
                            placeholder="0"
                            value={newRule.rangeStart}
                            onChange={e => setNewRule({ ...newRule, rangeStart: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">To (%)</label>
                        <input
                            type="number"
                            className="input-minimal"
                            placeholder="100"
                            value={newRule.rangeEnd}
                            onChange={e => setNewRule({ ...newRule, rangeEnd: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Multiplier (x)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input-minimal"
                            placeholder="1.0"
                            value={newRule.multiplier}
                            onChange={e => setNewRule({ ...newRule, multiplier: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary h-[38px] px-6"
                    >
                        Add Tier
                    </button>
                </form>
            </div>

            {/* Rules List */}
            <div className="card-flat overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Achievement Range</th>
                            <th className="px-6 py-3 font-medium">Multiplier</th>
                            <th className="px-6 py-3 font-medium">Description</th>
                            <th className="px-6 py-3 font-medium text-right">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {rules.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-zinc-400">No tiers defined. Add one above.</td>
                            </tr>
                        ) : rules.map(rule => (
                            <tr key={rule.id} className="group hover:bg-zinc-50 transition-colors">
                                <td className="px-6 py-4 text-zinc-900 font-mono">
                                    {rule.rangeStart}% - {rule.rangeEnd}%
                                </td>
                                <td className="px-6 py-4 font-semibold text-zinc-900">{rule.multiplier}x</td>
                                <td className="px-6 py-4 text-zinc-500">
                                    {rule.multiplier > 1 ? 'Accelerator' : rule.multiplier < 1 ? 'Decelerator' : 'Base Rate'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="text-zinc-300 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Settings;

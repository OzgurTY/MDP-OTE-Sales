import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const Targets = () => {
    const { currentUser } = useAuth();
    const [period, setPeriod] = useState('Q1');
    const [targetType, setTargetType] = useState('AMOUNT');
    const [amount, setAmount] = useState('');
    const [quantity, setQuantity] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const userId = currentUser?.id;

    useEffect(() => {
        if (userId) fetchTarget();
    }, [period, userId]);

    const fetchTarget = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.get(`/api/targets/${userId}/${period}`);
            setAmount(response.data.amount || '');
            setQuantity(response.data.quantity || '');
            setTargetType(response.data.targetType || 'AMOUNT');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setAmount('');
                setQuantity('');
                setTargetType('AMOUNT');
            } else {
                console.error("Error fetching target", error);
            }
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/targets', {
                userId,
                period,
                targetType,
                amount: targetType === 'AMOUNT' || targetType === 'HYBRID' ? parseFloat(amount) : 0,
                quantity: targetType === 'QUANTITY' || targetType === 'HYBRID' ? parseInt(quantity) : 0
            });
            setMessage('Changes saved.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving target", error);
            setMessage('Failed to save target.');
        }
    };

    return (
        <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Target Configuration</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="card-flat p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-900">Quota Period</h3>
                                <p className="text-xs text-zinc-500">Select the timeframe for this target.</p>
                            </div>
                        </div>

                        {message && (
                            <div className="mb-6 text-sm text-zinc-900 bg-zinc-100 px-3 py-2 rounded-md border border-zinc-200">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Period</label>
                                    <select
                                        className="input-minimal"
                                        value={period}
                                        onChange={e => setPeriod(e.target.value)}
                                    >
                                        <option value="Q1">Q1</option>
                                        <option value="Q2">Q2</option>
                                        <option value="Q3">Q3</option>
                                        <option value="Q4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Metric</label>
                                    <select
                                        className="input-minimal"
                                        value={targetType}
                                        onChange={e => setTargetType(e.target.value)}
                                    >
                                        <option value="AMOUNT">Revenue (₺)</option>
                                        <option value="QUANTITY">Volume (Qty)</option>
                                    </select>
                                </div>
                            </div>

                            {targetType !== 'QUANTITY' && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Target Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-zinc-400 text-sm">₺</span>
                                        <input
                                            type="number"
                                            className="input-minimal pl-7"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            required={targetType !== 'QUANTITY'}
                                        />
                                    </div>
                                </div>
                            )}

                            {targetType !== 'AMOUNT' && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Target Units</label>
                                    <input
                                        type="number"
                                        className="input-minimal"
                                        placeholder="0"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        required={targetType !== 'AMOUNT'}
                                    />
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex justify-center items-center"
                                >
                                    <Save size={16} className="mr-2" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar / Info Panel */}
                <div className="lg:col-span-1">
                    <div className="card-flat p-6 bg-blue-50/50 border-blue-100">
                        <h3 className="font-semibold text-blue-900 text-sm mb-2">About Targets</h3>
                        <p className="text-xs text-blue-800/80 leading-relaxed">
                            Setting a target establishes the baseline for your commission accelerators.
                            <br /><br />
                            **Revenue ($)**: Total booking amount required.<br />
                            **Volume (Qty)**: Number of deals required.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Targets;

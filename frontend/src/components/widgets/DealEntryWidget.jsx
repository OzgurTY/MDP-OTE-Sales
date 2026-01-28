import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DealEntryWidget = ({ onDealAdded }) => {
    const { currentUser } = useAuth();
    const userId = currentUser?.id;

    const [deal, setDeal] = useState({
        customerName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'CLOSED_WON',
        userId: userId
    });

    useEffect(() => {
        if (userId) {
            setDeal(d => ({ ...d, userId }));
        }
    }, [userId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onDealAdded(deal);
        setDeal({ ...deal, customerName: '', amount: '', date: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="card-flat p-4 mb-4 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider ml-0.5">Customer</label>
                        <input
                            type="text"
                            className="input-minimal"
                            placeholder="e.g. Acme Corp"
                            value={deal.customerName}
                            onChange={e => setDeal({ ...deal, customerName: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="w-32">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider ml-0.5">Stage</label>
                        <select
                            className="input-minimal"
                            value={deal.status}
                            onChange={e => setDeal({ ...deal, status: e.target.value })}
                        >
                            <option value="OPPORTUNITY">Opp</option>
                            <option value="PIPELINE">Pipeline</option>
                            <option value="UPSIDE">Upside</option>
                            <option value="COMMIT">Commit</option>
                            <option value="CLOSED_WON">Won</option>
                            <option value="CLOSED_LOST">Lost</option>
                        </select>
                    </div>
                </div>

                <div className="w-40">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider ml-0.5">Value</label>
                        <div className="flex bg-zinc-50/50 rounded-lg border border-zinc-200 overflow-hidden h-[34px]">
                            <select
                                className="bg-transparent text-xs font-medium text-zinc-600 px-2 border-r border-zinc-200 focus:outline-none h-full"
                                value={deal.currency || "TRY"}
                                onChange={e => setDeal({ ...deal, currency: e.target.value })}
                            >
                                <option value="TRY">₺</option>
                                <option value="USD">$</option>
                                <option value="EUR">€</option>
                            </select>
                            <input
                                type="number"
                                className="flex-1 bg-transparent px-3 text-xs focus:outline-none h-full"
                                placeholder="0.00"
                                value={deal.amount}
                                onChange={e => setDeal({ ...deal, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="w-40">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider ml-0.5">Close Date</label>
                        <input
                            type="date"
                            className="input-minimal"
                            value={deal.date}
                            onChange={e => setDeal({ ...deal, date: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="pb-0.5">
                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        <Plus size={16} className="mr-1" /> Add Deal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DealEntryWidget;

import { DollarSign, Calendar, Trash2 } from 'lucide-react';

const SalesKanban = ({ deals = [], onStatusChange, onDelete }) => {
    const stages = ['OPPORTUNITY', 'PIPELINE', 'UPSIDE', 'COMMIT', 'CLOSED_WON', 'CLOSED_LOST'];
    const getDealsByStage = (stage) => deals.filter(d => d.status === stage);

    const onDragStart = (e, dealId) => e.dataTransfer.setData("dealId", dealId);
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e, stage) => {
        const dealId = e.dataTransfer.getData("dealId");
        if (dealId) onStatusChange(dealId, stage);
    };

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 h-full w-full">
            {stages.map(stage => (
                <div
                    key={stage}
                    className={`min-w-[280px] w-[280px] rounded-xl p-3 flex flex-col h-full border backdrop-blur-md transition-colors
                        ${stage === 'CLOSED_LOST'
                            ? 'bg-red-50/50 border-red-100/50'
                            : 'bg-white/40 border-white/50'}`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, stage)}
                >
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-semibold text-zinc-700 text-xs tracking-tight">{stage}</h3>
                        <span className="bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {getDealsByStage(stage).length}
                        </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                        {getDealsByStage(stage).map(deal => (
                            <div
                                key={deal.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, deal.id)}
                                className="bg-white p-3 rounded border border-zinc-200 shadow-sm cursor-move hover:border-zinc-400 transition-colors group relative"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-medium text-zinc-900 text-sm truncate mr-2">{deal.customerName}</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
                                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        title="Delete Deal"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center text-zinc-600 text-xs font-medium mb-2">
                                    <div className="mr-0.5 font-sans">
                                        {deal.currency === 'USD' ? '$' : deal.currency === 'EUR' ? '€' : '₺'}
                                    </div>
                                    {Number(deal.amount).toLocaleString()}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                                    <div className="flex items-center text-[10px] text-zinc-400">
                                        <Calendar size={10} className="mr-1" />
                                        {deal.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SalesKanban;

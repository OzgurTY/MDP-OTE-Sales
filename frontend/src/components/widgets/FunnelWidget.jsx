import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FunnelWidget = ({ data }) => {
    if (!data) return <div className="p-4 text-xs text-zinc-400">No pipeline data</div>;

    const stages = ['OPPORTUNITY', 'PIPELINE', 'UPSIDE', 'COMMIT', 'CLOSED_WON'];
    const chartData = stages.map(stage => ({
        name: stage,
        count: data.counts[stage] || 0,
        amount: data.amounts[stage] || 0
    }));

    // Minimalist monochrome palette (zinc scales) + win color
    const colors = ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#18181b'];

    return (
        <div className="card-flat p-6 h-full">
            <h3 className="font-semibold text-zinc-900 mb-6 text-sm">Pipeline Velocity</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" barSize={24}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 11, fill: '#71717a' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#fafafa' }}
                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val, name) => [name === 'amount' ? `$${val.toLocaleString()}` : val, name]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index] || '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Conversion Stats */}
            <div className="mt-6 flex justify-between px-2 text-center">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-zinc-900">{Math.round(data.conversionRates?.pipelineToUpside * 100)}%</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Pipe → Upside</span>
                </div>
                <div className="w-px bg-zinc-100 h-8"></div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-zinc-900">{Math.round(data.conversionRates?.upsideToCommit * 100)}%</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Upside → Commit</span>
                </div>
                <div className="w-px bg-zinc-100 h-8"></div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-zinc-900">{Math.round(data.conversionRates?.commitToWin * 100)}%</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Commit → Win</span>
                </div>
            </div>
        </div>
    );
};

export default FunnelWidget;

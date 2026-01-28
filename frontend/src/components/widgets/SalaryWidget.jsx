import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SalaryWidget = ({ baseSalary = 0, commission = 0 }) => {

    const data = [
        { name: 'Base', value: baseSalary },
        { name: 'Commission', value: commission },
    ];

    const COLORS = ['#f4f4f5', '#18181b']; // Zinc-100 and Zinc-900

    const total = baseSalary + commission;

    return (
        <div className="card-flat p-6 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="font-semibold text-zinc-900 text-sm">Compensation</h3>
                <p className="text-2xl font-bold text-zinc-900 mt-2">
                    ₺{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <span className="text-xs text-zinc-500">Period Total (Est)</span>
            </div>

            <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`₺${value.toLocaleString()}`, '']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-xs text-zinc-500 ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalaryWidget;

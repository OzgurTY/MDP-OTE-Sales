import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FunnelWidget from '../components/widgets/FunnelWidget';
import SalaryWidget from '../components/widgets/SalaryWidget';

import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(''); // Empty = All Time
    const userId = currentUser?.id;

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Pass period filter to backend
                const [statsRes, analyticsRes] = await Promise.all([
                    axios.get(`/api/dashboard/stats?userId=${userId}&period=${period}`),
                    axios.get(`/api/analytics/funnel/${userId}`)
                ]);

                setStats(statsRes.data);
                setAnalytics(analyticsRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    if (loading && !stats) return <div className="p-8 text-sm text-zinc-500">Loading data...</div>;
    if (!stats) return <div className="p-8 text-sm text-red-500">Error loading data.</div>;

    // Calculate monthly base salary
    // Formula: (Annual OTE * (100 - VariableSplit%) / 100) / 12
    const variableSplit = stats.variableSplit || 50; // Default 50%
    const annualBase = stats.annualOTE * ((100 - variableSplit) / 100);
    const baseSalary = annualBase / 12;
    const commission = stats.commissionEarned || 0;

    return (
        <div className="space-y-4">
            {/* Header / Filter */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-zinc-900">Executive Summary</h2>
                <div className="flex items-center space-x-2">
                    <select
                        className="input-minimal w-40 text-xs"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="">All Time</option>
                        <optgroup label="2026 Quarters">
                            <option value="Q1_2026">Q1 2026</option>
                            <option value="Q2_2026">Q2 2026</option>
                            <option value="Q3_2026">Q3 2026</option>
                            <option value="Q4_2026">Q4 2026</option>
                        </optgroup>
                        <optgroup label="Months">
                            <option value="2026-01">Jan 2026</option>
                            <option value="2026-02">Feb 2026</option>
                            <option value="2026-03">Mar 2026</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Top Stats Row - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-flat p-5 border-l-4 border-l-zinc-200 flex flex-col justify-between">
                    <div>
                        <h3 className="text-zinc-500 font-semibold text-xs mb-1 uppercase tracking-wider">Achievement</h3>
                        <div className="flex items-baseline mt-1">
                            <span className="text-3xl font-bold text-zinc-900">{stats.achievementRate.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-800" style={{ width: `${Math.min(stats.achievementRate, 100)}%` }}></div>
                    </div>
                </div>

                <div className="card-accent p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-12 h-12 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-emerald-800/90 font-bold text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Commission
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-emerald-700/70 font-semibold mb-0.5">Quarter (Q1)</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-zinc-900">₺{(stats.commissionQTD || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-emerald-100/50">
                                <p className="text-[10px] uppercase tracking-wide text-emerald-700/70 font-semibold mb-0.5">Month (Jan)</p>
                                <div className="flex items-baseline">
                                    <span className="text-lg font-semibold text-zinc-700">₺{(stats.commissionMTD || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-flat p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-zinc-500 font-semibold text-xs mb-1 uppercase tracking-wider">Closed Sales</h3>
                        <div className="flex items-baseline mt-1">
                            <span className="text-3xl font-bold text-zinc-900">₺{stats.totalSales.toLocaleString()}</span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">{stats.dealCount} Deals closed</p>
                </div>

                <div className="card-flat p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-zinc-500 font-semibold text-xs mb-1 uppercase tracking-wider">Annual OTE</h3>
                        <div className="flex items-baseline mt-1">
                            <span className="text-3xl font-bold text-zinc-900">₺{(stats.annualOTE / 1000).toFixed(0)}k</span>
                        </div>
                    </div>
                    <p className="text-xs text-cyan-600 mt-2 font-medium">Monthly: ₺{(stats.annualOTE / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
            </div>

            {/* Main Widget Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend (2 cols) */}
                <div className="lg:col-span-2 card-flat p-6">
                    <h3 className="font-semibold text-zinc-900 mb-6 text-sm">Performance Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesTrend} barSize={32}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: '#f4f4f5' }}
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`₺${value.toLocaleString()}`, '']}
                                />
                                <Bar dataKey="value" fill="#18181b" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Salary Composition (1 col) */}
                <div className="lg:col-span-1">
                    <SalaryWidget baseSalary={baseSalary} commission={commission} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Funnel Widget */}
                <div className="h-auto">
                    <FunnelWidget data={analytics} />
                </div>

                {/* Recent Activity */}
                <div className="card-flat p-6">
                    <h3 className="font-semibold text-zinc-900 mb-4 text-sm">Activity Feed</h3>
                    <div className="space-y-4">
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 
                                        ${item.type === 'SUCCESS' ? 'bg-emerald-500' :
                                            item.type === 'ERROR' ? 'bg-red-500' :
                                                item.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                                        <p className="text-xs text-zinc-500 mt-0.5 whitespace-pre-line">{item.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-zinc-400 italic">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;

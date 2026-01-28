import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '../contexts/AuthContext';

const Earnings = () => {
    const { currentUser } = useAuth();
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = currentUser?.id;
    // const baseSalary = 15000 * 12; // Deprecated, fetched from profile

    useEffect(() => {
        if (userId) fetchEarnings();
    }, [userId]);

    const fetchEarnings = async () => {
        try {
            // 1. Fetch Earnings Records
            const earningsRes = await axios.get(`/api/earnings/${userId}`);

            // 2. Fetch Compensation Stats (re-using Dashboard endpoint for aggregate or calculating here)
            // For now, let's just use the earnings response to sum up
            const records = earningsRes.data;
            const totalComm = records.reduce((sum, r) => sum + r.commissionAmount, 0);

            // Calculate MTD and QTD
            // Assume "Current" is based on real date or Demo Date (Jan 2026)
            const now = new Date();
            // Force Demo Date: Jan 2026 for consistency if no real data found today? 
            // Better to use real date for logic, but demo data is in 2026.
            // Let's use 2026-01 as "Current" for demo purposes to match Dashboard
            const currentYear = 2026;
            const currentMonth = 1; // Jan (1-based)
            const currentQuarter = 1; // Q1

            const commissionsQTD = records
                .filter(r => {
                    if (!r.date) return false;
                    const d = new Date(r.date);
                    const q = Math.floor(d.getMonth() / 3) + 1;
                    return d.getFullYear() === currentYear && q === currentQuarter;
                })
                .reduce((sum, r) => sum + r.commissionAmount, 0);

            // Force MTD to be 1/3 of QTD as per user rule
            const commissionsMTD = commissionsQTD / 3;

            // 3. Fetch Profile for Base Salary info
            const profileRes = await axios.get(`/api/compensation/${userId}`);
            const profile = profileRes.data || { annualOTE: 0, baseSplit: 50 }; // Guard
            const annualizedBase = (profile.annualOTE || 0) * ((profile.baseSplit || 50) / 100);
            const monthlyBase = annualizedBase / 12;

            // Construct breakdown
            setBreakdown({
                ytdCommission: totalComm,
                mtdCommission: commissionsMTD,
                qtdCommission: commissionsQTD,
                monthlyBase: monthlyBase,
                pendingCommission: commissionsMTD,
                projectedAnnual: profile.annualOTE,
                history: [
                    { month: 'Jan', base: monthlyBase, comm: totalComm }
                ],
                records: records
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            // Fallback to zeros on error so page doesn't crash
            setBreakdown({
                ytdCommission: 0,
                mtdCommission: 0,
                qtdCommission: 0,
                monthlyBase: 0,
                pendingCommission: 0,
                projectedAnnual: 0,
                history: [],
                records: []
            });
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-sm text-zinc-500">Loading earnings data...</div>;
    if (!breakdown) return <div className="p-8 text-sm text-zinc-500">No earnings data available.</div>;

    // Calculations for Display
    const monthlyTotal = breakdown.monthlyBase + breakdown.mtdCommission;
    const quarterlyTotal = (breakdown.monthlyBase * 3) + breakdown.qtdCommission;

    // Export to PDF
    const handleExport = () => {
        if (!breakdown) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // --- Header ---
        doc.setFillColor(24, 24, 27); // Zinc-900 like
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Logo / Title
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text("MDP", 15, 20);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text("Sales Calculator", 15, 28);

        // Statement Title
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("COMMISSION STATEMENT", pageWidth - 15, 25, { align: 'right' });

        // Period Info
        doc.setFontSize(10);
        doc.setTextColor(161, 161, 170); // Zinc-400
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 32, { align: 'right' });

        // --- Summary Section ---
        const startY = 55;

        // Box 1: Total Earnings
        doc.setDrawColor(228, 228, 231); // Zinc-200
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, startY, 55, 30, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122); // Zinc-500
        doc.text("TOTAL EARNINGS (QTD)", 20, startY + 10);
        doc.setFontSize(14);
        doc.setTextColor(24, 24, 27); // Zinc-900
        doc.setFont('helvetica', 'bold');
        doc.text(`TL ${quarterlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 20, startY + 22);

        // Box 2: Commission Paid
        doc.roundedRect(77, startY, 55, 30, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text("COMMISSION PAID", 82, startY + 10);
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.setFont('helvetica', 'bold');
        doc.text(`TL ${(breakdown.qtdCommission || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 82, startY + 22);

        // Box 3: Pending Payout
        doc.roundedRect(139, startY, 55, 30, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(113, 113, 122);
        doc.text("PENDING PAYOUT", 144, startY + 10);
        doc.setFontSize(14);
        doc.setTextColor(245, 158, 11); // Amber-500
        doc.setFont('helvetica', 'bold');
        doc.text(`TL ${breakdown.pendingCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 144, startY + 22);

        // --- Details Table ---
        const tableColumn = ["Date", "Customer", "Status", "Amount (TL)", "Commission (TL)"];
        const tableRows = [];

        breakdown.records.forEach(record => {
            const rowData = [
                record.date || '-',
                record.customerName || '',
                record.status,
                record.dealAmount.toFixed(2),
                record.commissionAmount.toFixed(2)
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: startY + 45,
            theme: 'grid',
            headStyles: {
                fillColor: [24, 24, 27], // Black header
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            }
        });

        doc.save(`mdp_statement_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-900">Compensation Overview</h2>
                <button onClick={handleExport} className="btn-secondary">Export Payslip</button>
            </div>

            {/* Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-flat p-6 bg-zinc-900 text-white border-zinc-900 flex flex-col justify-between">
                    <div>
                        <h3 className="text-zinc-400 font-medium text-xs mb-4 uppercase tracking-wider">Total Earnings</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-0.5">Quarter (Base + Comm)</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-white">₺{quarterlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-800">
                                <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-0.5">Month (Base + Comm)</p>
                                <div className="flex items-baseline">
                                    <span className="text-lg font-semibold text-zinc-300">₺{monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-flat p-6 flex flex-col justify-between border-emerald-500/30 shadow-sm shadow-emerald-500/5">
                    <div>
                        <h3 className="text-zinc-500 font-medium text-xs mb-4 uppercase tracking-wider">Commission Paid</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-emerald-600/70 font-semibold mb-0.5">Quarter (Q1)</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-zinc-900">₺{(breakdown.qtdCommission || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-flat p-6 flex flex-col justify-between border-amber-500/30 shadow-sm shadow-amber-500/5">
                    <div>
                        <h3 className="text-zinc-500 font-medium text-xs mb-4 uppercase tracking-wider">Pending Payout</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-amber-600/70 font-semibold mb-0.5">Current Month</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-zinc-900">₺{breakdown.pendingCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-100">
                                <p className="text-[10px] uppercase tracking-wide text-zinc-400 font-semibold mb-0.5">Est. Payment</p>
                                <div className="text-sm font-medium text-zinc-600">Feb 28</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="card-flat p-8">
                <h3 className="font-semibold text-zinc-900 mb-8 text-sm">Earnings History</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={breakdown.history}>
                            <defs>
                                <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="comm" stroke="#18181b" fillOpacity={1} fill="url(#colorComm)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Payouts Table */}
            <div className="card-flat overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="font-semibold text-zinc-900 text-sm">Recent Payouts</h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Period</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Amount</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {breakdown.records && breakdown.records.map((record) => (
                            <tr key={record.dealId} className="hover:bg-zinc-50">
                                <td className="px-6 py-4 text-zinc-900">Current</td>
                                <td className="px-6 py-4 text-zinc-600">Deal Commission</td>
                                <td className="px-6 py-4 font-medium text-zinc-900">₺{record.commissionAmount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-0.5 rounded ${record.status === 'CLOSED_WON' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}`}>
                                        {record.status === 'CLOSED_WON' ? 'Paid' : record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-500">-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Earnings;

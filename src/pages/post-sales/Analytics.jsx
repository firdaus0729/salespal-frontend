import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

const HEALTH_COLORS = { Healthy: '#10b981', Stable: '#3b82f6', 'At Risk': '#f59e0b', Critical: '#ef4444' };
const getHealthLabel = (s) => { if (s >= 90) return 'Healthy'; if (s >= 70) return 'Stable'; if (s >= 40) return 'At Risk'; return 'Critical'; };

const Analytics = () => {
    const { customers, payments, documents } = usePostSales();

    // Customer status breakdown
    const statusMap = {};
    customers.forEach(c => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Plan distribution
    const planMap = {};
    customers.forEach(c => { planMap[c.plan] = (planMap[c.plan] || 0) + 1; });
    const planData = Object.entries(planMap).map(([name, count]) => ({ name, count }));

    // Health breakdown
    const healthMap = {};
    customers.filter(c => c.healthScore !== null).forEach(c => {
        const label = getHealthLabel(c.healthScore);
        healthMap[label] = (healthMap[label] || 0) + 1;
    });
    const healthDist = Object.entries(healthMap).map(([name, value]) => ({ name, value, fill: HEALTH_COLORS[name] }));

    // Payment revenue by month (requires backend aggregation)
    const revenueData = [];

    // Radar - module completeness
    const radarData = [
        { metric: 'Onboarding', score: Math.round((customers.filter(c => c.onboardingStatus === 'completed').length / Math.max(1, customers.length)) * 100) },
        { metric: 'Documents', score: Math.round((documents.filter(d => d.status === 'verified').length / Math.max(1, documents.length)) * 100) },
        { metric: 'Payments', score: Math.round((payments.filter(p => p.status === 'paid').length / Math.max(1, payments.length)) * 100) },
        { metric: 'Health', score: Math.round((customers.filter(c => c.healthScore >= 70).length / Math.max(1, customers.filter(c => c.healthScore !== null).length)) * 100) || 0 },
        { metric: 'Retention', score: Math.round(((customers.length - customers.filter(c => c.status === 'Churned').length) / Math.max(1, customers.length)) * 100) },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-indigo-500" /> Analytics
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Customer success performance metrics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Status Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">Customer Status Breakdown</h3>
                    <p className="text-xs text-gray-400 mb-4">Distribution by lifecycle status</p>
                    <div className="h-[200px] min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={statusData} barSize={28}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                            <Bar dataKey="value" name="Customers" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>

                </div>

                {/* Health Score Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">Health Score Distribution</h3>
                    <p className="text-xs text-gray-400 mb-4">Customer health at a glance</p>
                    {healthDist.length > 0 ? (
                        <div className="h-[200px] min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">

                            <PieChart>
                                <Pie data={healthDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={10}>
                                    {healthDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        </div>

                    ) : <div className="h-40 flex items-center justify-center text-sm text-gray-400">Insufficient health data</div>}
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">Revenue vs. Collected</h3>
                    <p className="text-xs text-gray-400 mb-4">Monthly billing vs actual collected</p>
                    <div className="h-[200px] min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">

                        <LineChart data={revenueData}>
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="revenue" name="Invoiced" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="paid" name="Collected" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>

                </div>

                {/* Radar / Success */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 mb-1">Success Radar</h3>
                    <p className="text-xs text-gray-400 mb-4">Overall module health across dimensions</p>
                    <div className="h-[200px] min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">

                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#f0f0f0" />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                            <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                    </div>

                </div>
            </div>

            {/* Plans */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Customers by Plan</h3>
                <div className="flex flex-wrap gap-4">
                    {planData.map(p => (
                        <div key={p.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{p.count}</div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400">plan</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;

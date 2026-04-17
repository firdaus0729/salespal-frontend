import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import TopHeader from './components/TopHeader';
import ChartCard from './components/ChartCard';
import api from '../../lib/api';

const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / .06)',
};

const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
};

const PIE_COLORS = ['#3b82f6', '#a78bfa', '#34d399', '#f59e0b', '#f472b6'];

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [analyticsRes, campaignsRes] = await Promise.all([
                    api.get('/admin/analytics'),
                    api.get('/admin/campaigns'),
                ]);
                setAnalytics(analyticsRes.analytics);
                setCampaigns(campaignsRes.campaigns || []);
            } catch (err) {
                setError(err.message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Analytics" subtitle="Platform-wide performance insights" />
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500 text-sm">Loading analytics…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Analytics" subtitle="Platform-wide performance insights" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-600 underline">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    const a = analytics || {};

    // Build subscription module breakdown for bar chart
    const subscriptionBreakdown = (a.activeSubscriptions || []).map(s => ({
        name: (s.module || 'Unknown').charAt(0).toUpperCase() + (s.module || 'Unknown').slice(1),
        count: parseInt(s.count),
    }));

    // Build pie chart data from subscription breakdown
    const subscriptionPie = (a.activeSubscriptions || []).map((s, i) => ({
        name: (s.module || 'Unknown').charAt(0).toUpperCase() + (s.module || 'Unknown').slice(1),
        value: parseInt(s.count),
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    // Campaign status breakdown for bar chart
    const statusCounts = {};
    campaigns.forEach(c => {
        const st = c.status || 'draft';
        statusCounts[st] = (statusCounts[st] || 0) + 1;
    });
    const campaignStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        campaigns: count,
    }));

    // Platform breakdown for campaigns
    const platformCounts = {};
    campaigns.forEach(c => {
        const pl = c.platform || 'Other';
        platformCounts[pl] = (platformCounts[pl] || 0) + 1;
    });
    const platformData = Object.entries(platformCounts).map(([platform, count]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        campaigns: count,
    }));

    const growthPercent = a.totalUsers > 0 ? ((a.newUsers30Days / a.totalUsers) * 100).toFixed(1) : 0;

    const kpiCards = [
        {
            label: 'Total Users',
            value: (a.totalUsers || 0).toLocaleString(),
            change: `+${growthPercent}%`,
            positive: true,
            onClick: () => navigate('/admin/users'),
            description: 'View all users',
        },
        {
            label: 'Active Subscriptions',
            value: (a.totalActiveSubscriptions || 0).toLocaleString(),
            change: '',
            positive: true,
            onClick: () => navigate('/admin/subscriptions'),
            description: 'View subscriptions',
        },
        {
            label: 'Total Campaigns',
            value: (a.totalCampaigns || 0).toLocaleString(),
            change: `${a.activeCampaigns || 0} active`,
            positive: true,
            onClick: () => navigate('/admin/campaigns'),
            description: 'View campaign details',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(a.totalRevenue || 0),
            change: '',
            positive: true,
            onClick: () => navigate('/admin/subscriptions'),
            description: 'View revenue details',
        },
    ];

    return (
        <div className="flex flex-col">
            <TopHeader title="Analytics" subtitle="Platform-wide performance insights" />

            <div className="p-6 space-y-5">
                {/* KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kpiCards.map((k) => (
                        <div
                            key={k.label}
                            onClick={k.onClick}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 group"
                            title={k.description}
                        >
                            <p className="text-xs text-gray-500 mb-1 group-hover:text-blue-600 transition-colors">{k.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                            {k.change && (
                                <p className={`text-xs font-medium mt-1 ${k.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {k.change}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {k.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Row 1 – Subscription Breakdown + Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {subscriptionBreakdown.length > 0 && (
                        <ChartCard title="Subscriptions by Module" subtitle="Active subscription distribution">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={subscriptionBreakdown} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Subscriptions" barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {subscriptionPie.length > 0 && (
                        <ChartCard title="Module Distribution" subtitle="Subscription share by module">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={subscriptionPie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {subscriptionPie.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-3 space-y-2">
                                {subscriptionPie.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    )}
                </div>

                {/* Row 2 – Campaign Status + Platform Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {campaignStatusData.length > 0 && (
                        <ChartCard title="Campaign Status" subtitle="Campaigns by current status">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={campaignStatusData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="campaigns" fill="#10b981" radius={[4, 4, 0, 0]} name="Campaigns" barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {platformData.length > 0 && (
                        <ChartCard title="Platform Distribution" subtitle="Campaigns by platform">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="campaigns" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Campaigns" barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}
                </div>

                {/* Empty state fallback */}
                {subscriptionBreakdown.length === 0 && campaignStatusData.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
                        <p className="text-gray-400">No analytics data available yet. Data will appear as users create campaigns and subscriptions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;

import React, { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, Megaphone, FolderKanban, Loader2 } from 'lucide-react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { useNavigate } from 'react-router-dom';

import TopHeader from './components/TopHeader';
import MetricCard from './components/MetricCard';
import AdminTable from './components/AdminTable';
import ChartCard from './components/ChartCard';
import ActivityFeed from './components/ActivityFeed';
import AlertCard from './components/AlertCard';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';

// ── Column config ──────────────────────────────────────────────────────────────

const statusVariant = { active: 'success', paused: 'warning', completed: 'default' };

const projectColumns = [
    { key: 'name',              label: 'Project Name' },
    { key: 'organization_name', label: 'Organization', render: (v) => <span className="text-gray-500">{v || '—'}</span> },
    {
        key: 'created_at',
        label: 'Created',
        render: (v) => <span className="text-gray-500">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

const PIE_COLORS = ['#3b82f6', '#a78bfa', '#34d399', '#f59e0b', '#f472b6'];

// ── Component ──────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [analyticsRes, projectsRes] = await Promise.all([
                    api.get('/admin/analytics'),
                    api.get('/admin/projects'),
                ]);
                setAnalytics(analyticsRes.analytics);
                setProjects((projectsRes.projects || []).slice(0, 5));
            } catch (err) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <TopHeader title="Admin Panel" />
                <div className="flex items-center justify-center py-32 flex-1">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500 text-sm">Loading dashboard…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full">
                <TopHeader title="Admin Panel" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 font-medium bg-white text-sm text-red-600 border border-red-200 rounded-lg shadow-sm hover:bg-red-50">Retry Connection</button>
                    </div>
                </div>
            </div>
        );
    }

    const a = analytics || {};
    const totalActiveSubs = a.totalActiveSubscriptions || 0;
    const growthPercent = a.totalUsers > 0 ? ((a.newUsers30Days / a.totalUsers) * 100).toFixed(0) : 0;

    // Build subscription breakdown for pie chart
    const subscriptionData = (a.activeSubscriptions || []).map((s, i) => ({
        name: s.module || 'Unknown',
        value: parseInt(s.count),
        color: PIE_COLORS[i % PIE_COLORS.length],
    }));

    // Map recent audit logs to activity feed format
    const recentActivities = (a.recentUsers || []).map(u => ({
        type: 'user',
        message: `New user registered – ${u.email}`,
        time: timeAgo(u.created_at),
    }));

    // Map audit logs to system alerts
    const systemAlerts = (a.recentActivity || []).slice(0, 5).map(log => ({
        type: log.action_type?.includes('REFUND') ? 'error' :
              log.action_type?.includes('STATUS') ? 'warning' :
              log.action_type?.includes('BROADCAST') ? 'info' : 'success',
        message: `${(log.user_name || log.user_email || 'Admin')} — ${(log.action_type || '').replace(/_/g, ' ').toLowerCase()}`,
        time: timeAgo(log.created_at),
    }));

    return (
        <div className="flex flex-col min-h-full">
            <TopHeader title="Admin Panel" />

            <div className="p-6 space-y-6">
                
                {/* ── KPI SECTION ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={a.totalUsers?.toLocaleString() || '0'}
                        trend={`+${growthPercent}%`}
                        trendLabel=" this month"
                        icon={Users}
                        iconColor="text-blue-600"
                        iconBg="bg-blue-50"
                        onClick={() => navigate('/admin/users')}
                    />
                    <MetricCard
                        title="Active Subscriptions"
                        value={totalActiveSubs.toLocaleString()}
                        icon={CreditCard}
                        iconColor="text-purple-600"
                        iconBg="bg-purple-50"
                        onClick={() => navigate('/admin/subscriptions')}
                    />
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(a.totalRevenue || 0)}
                        icon={DollarSign}
                        iconColor="text-emerald-600"
                        iconBg="bg-emerald-50"
                        onClick={() => navigate('/admin/subscriptions')}
                    />
                    <MetricCard
                        title="Active Campaigns"
                        value={(a.activeCampaigns || 0).toLocaleString()}
                        icon={Megaphone}
                        iconColor="text-orange-600"
                        iconBg="bg-orange-50"
                        onClick={() => navigate('/admin/campaigns')}
                    />
                    <MetricCard
                        title="Total Projects"
                        value={(a.totalProjects || 0).toLocaleString()}
                        icon={FolderKanban}
                        iconColor="text-cyan-600"
                        iconBg="bg-cyan-50"
                        onClick={() => navigate('/admin/projects')}
                    />
                </div>

                {/* ── TOP SECTION: Charts & Stats ── */}
                {subscriptionData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        
                        {/* LEFT: Chart (2 cols) */}
                        <div className="lg:col-span-2 flex flex-col h-full">
                            <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                   <div>
                                       <h3 className="text-base font-bold text-gray-900">Subscription Breakdown</h3>
                                       <p className="text-sm font-medium text-gray-500 mt-0.5">Active subscriptions by module distribution</p>
                                   </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={subscriptionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={105}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {subscriptionData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    fontSize: 13,
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    
                                    {/* Legend neatly arranged vertically or horizontally */}
                                    <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 px-4">
                                        {subscriptionData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-2.5 text-sm">
                                                <span
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-gray-600 capitalize font-medium">{item.name}</span>
                                                <span className="font-bold text-gray-900 ml-1">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT: Stats Cards (1 col, stacked) */}
                        <div className="grid grid-cols-1 gap-6 h-full">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-500 mb-1">New Users (30 days)</p>
                                <p className="text-3xl font-extrabold text-blue-600">{a.newUsers30Days || 0}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Campaigns</p>
                                <p className="text-3xl font-extrabold text-orange-600">{a.totalCampaigns || 0}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                                <p className="text-3xl font-extrabold text-cyan-600">{a.totalProjects || 0}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-500 mb-1">Active Modules</p>
                                <p className="text-3xl font-extrabold text-emerald-600">{subscriptionData.length}</p>
                            </div>
                        </div>

                    </div>
                )}

                {/* ── ROW 3: Recent Activity + System Alerts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden h-full flex flex-col">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 shrink-0">Recent Activity</h3>
                        <div className="flex-1">
                            {recentActivities.length > 0 ? (
                                <ActivityFeed activities={recentActivities} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm font-medium text-gray-400 text-center py-4">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden h-full flex flex-col">
                        <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 shrink-0">Admin Actions</h3>
                        <div className="flex-1">
                            {systemAlerts.length > 0 ? (
                                <AlertCard alerts={systemAlerts} />
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm font-medium text-gray-400 text-center py-4">No recent admin actions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── ROW 4: Recent Projects Table ── */}
                {projects.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Recent Projects</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">
                                Latest projects initialized across all organizations
                            </p>
                        </div>
                        <AdminTable
                            columns={projectColumns}
                            data={projects}
                            actions={[{
                                label: 'Open Workspace',
                                variant: 'primary',
                                onClick: (row) => navigate(`/admin/projects/${row.id}`),
                            }]}
                            onRowClick={(row) => navigate(`/admin/projects/${row.id}`)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

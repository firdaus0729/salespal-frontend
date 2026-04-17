import React, { useState, useEffect } from 'react';
import { Search, Megaphone, Loader2 } from 'lucide-react';
import TopHeader from './components/TopHeader';
import AdminTable from './components/AdminTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const statusColors = { active: 'success', paused: 'warning', completed: 'default', draft: 'default' };

const AdminCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/campaigns');
            setCampaigns(data.campaigns || []);
        } catch (err) {
            setError(err.message || 'Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const filtered = campaigns.filter(
        (c) =>
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.platform || '').toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            label: 'Campaign Name',
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Megaphone size={16} className="text-orange-500" />
                    </div>
                    <span className="font-medium text-gray-900">{v || '—'}</span>
                </div>
            ),
        },
        { key: 'organization_name', label: 'Organization', render: (v) => <span className="text-gray-600">{v || '—'}</span> },
        {
            key: 'platform',
            label: 'Platform',
            render: (v) => <Badge variant="primary" className="capitalize">{v || '—'}</Badge>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <Badge variant={statusColors[v] || 'default'} className="capitalize">
                    {v || 'draft'}
                </Badge>
            ),
        },
        {
            key: 'launched_at',
            label: 'Launched',
            render: (v) => <span className="text-gray-500">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
        },
    ];

    const statCards = [
        { label: 'Total Campaigns', value: campaigns.length.toString(),                                                   color: 'text-blue-600'    },
        { label: 'Active',          value: campaigns.filter((c) => c.status === 'active').length.toString(),              color: 'text-emerald-600' },
        { label: 'Paused',          value: campaigns.filter((c) => c.status === 'paused').length.toString(),              color: 'text-amber-600'   },
        { label: 'Completed',       value: campaigns.filter((c) => c.status === 'completed').length.toString(),           color: 'text-gray-500'    },
    ];

    if (loading) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Campaigns" subtitle="All campaigns across the platform" />
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500">Loading campaigns…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Campaigns" subtitle="All campaigns across the platform" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={fetchCampaigns} className="mt-3 text-sm text-red-600 underline">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <TopHeader title="Campaigns" subtitle="All campaigns across the platform" />

            <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((s) => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            All Campaigns
                            <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                        </h3>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-52"
                            />
                        </div>
                    </div>
                    <AdminTable
                        columns={columns}
                        data={filtered}
                        actions={[
                            { label: 'View', variant: 'primary', onClick: (row) => navigate(`/admin/campaigns/${row.id}`) },
                        ]}
                        onRowClick={(row) => navigate(`/admin/campaigns/${row.id}`)}
                        emptyMessage="No campaigns match your search."
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminCampaigns;

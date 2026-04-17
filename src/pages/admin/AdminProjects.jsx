import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, Loader2 } from 'lucide-react';
import TopHeader from './components/TopHeader';
import AdminTable from './components/AdminTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const statusColors = { active: 'success', paused: 'warning', completed: 'default', archived: 'default' };

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/projects');
            setProjects(data.projects || []);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const filtered = projects.filter(
        (p) =>
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.organization_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            label: 'Project Name',
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FolderKanban size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{v || '—'}</span>
                </div>
            ),
        },
        { key: 'organization_name', label: 'Organization', render: (v) => <span className="text-gray-600">{v || '—'}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <Badge variant={statusColors[v] || 'default'} className="capitalize">
                    {v || 'active'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Created Date',
            render: (v) => <span className="text-gray-500">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
        },
    ];

    const statCards = [
        { label: 'Total Projects', value: projects.length.toString(),                                                       color: 'text-blue-600'    },
        { label: 'Active',         value: projects.filter((p) => (p.status || 'active') === 'active').length.toString(),    color: 'text-emerald-600' },
        { label: 'Paused',         value: projects.filter((p) => p.status === 'paused').length.toString(),                  color: 'text-amber-600'   },
        { label: 'Completed',      value: projects.filter((p) => p.status === 'completed').length.toString(),               color: 'text-gray-500'    },
    ];

    if (loading) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Projects" subtitle="All projects across the platform" />
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500">Loading projects…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Projects" subtitle="All projects across the platform" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={fetchProjects} className="mt-3 text-sm text-red-600 underline">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <TopHeader title="Projects" subtitle="All projects across the platform" />

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
                            All Projects
                            <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                        </h3>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects…"
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
                            { label: 'View', variant: 'primary', onClick: (row) => navigate(`/admin/projects/${row.id}`) },
                        ]}
                        onRowClick={(row) => navigate(`/admin/projects/${row.id}`)}
                        emptyMessage="No projects match your search."
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminProjects;

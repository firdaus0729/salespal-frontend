import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import TopHeader from './components/TopHeader';
import AdminTable from './components/AdminTable';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const roleColors = { admin: 'purple', user: 'default' };
const statusColors = { active: 'success', suspended: 'destructive', banned: 'destructive', inactive: 'default' };
const statusFilters = ['All', 'active', 'suspended', 'banned'];
const roleFilters = ['All', 'admin', 'user'];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();

    const [modalConfig, setModalConfig] = useState(null); // { type: 'role'|'status', user, newRole, newStatus, title, message }
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/users');
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = (row) => {
        const newRole = row.role === 'admin' ? 'user' : 'admin';
        setModalConfig({
            type: 'role',
            user: row,
            newRole,
            title: `${newRole === 'admin' ? 'Promote' : 'Demote'} User`,
            message: `Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} ${row.full_name || row.email} to ${newRole}?`,
            confirmText: newRole === 'admin' ? 'Promote' : 'Demote',
            variant: 'primary'
        });
    };

    const handleSuspend = (row) => {
        const newStatus = (row.status || 'active') === 'active' ? 'suspended' : 'active';
        const label = newStatus === 'suspended' ? 'Suspend' : 'Activate';
        setModalConfig({
            type: 'status',
            user: row,
            newStatus,
            title: `${label} User`,
            message: `Are you sure you want to ${label.toLowerCase()} ${row.full_name || row.email}?`,
            confirmText: label,
            variant: newStatus === 'suspended' ? 'danger' : 'primary'
        });
    };

    const handleConfirmAction = async () => {
        if (!modalConfig) return;
        const { type, user, newRole, newStatus } = modalConfig;
        
        try {
            setIsActionLoading(true);
            if (type === 'role') {
                await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                showToast({
                    title: 'Role Updated',
                    description: `${user.full_name || user.email} is now a ${newRole}.`,
                    variant: 'success'
                });
            } else {
                await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                showToast({
                    title: 'Status Updated',
                    description: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully.`,
                    variant: 'success'
                });
            }
        } catch (err) {
            showToast({
                title: 'Operation Failed',
                description: err.message || 'Failed to update user.',
                variant: 'error'
            });
        } finally {
            setIsActionLoading(false);
            setModalConfig(null);
        }
    };

    const filtered = users.filter((u) => {
        const matchSearch =
            (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || (u.status || 'active') === statusFilter;
        const matchRole = roleFilter === 'All' || u.role === roleFilter;
        return matchSearch && matchStatus && matchRole;
    });

    const columns = [
        {
            key: 'full_name',
            label: 'Name',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(val || row.email || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="font-medium text-gray-900">
                        {val || '—'}
                        {row.id === currentUser?.id && (
                            <span className="ml-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                You
                            </span>
                        )}
                    </span>
                </div>
            ),
        },
        { key: 'email', label: 'Email', render: (v) => <span className="text-gray-500">{v}</span> },
        { key: 'role', label: 'Role', render: (v) => <Badge variant={roleColors[v] || 'default'} className="capitalize">{v}</Badge> },
        { key: 'organization_name', label: 'Organization', render: (v) => <span className="text-gray-500">{v || '—'}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <Badge variant={statusColors[v || 'active'] || 'default'} className="capitalize">
                    {v || 'active'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Joined',
            render: (v) => <span className="text-gray-500">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
        },
    ];

    const statCards = [
        { label: 'Total Users',   value: users.length.toLocaleString(),                                            color: 'text-blue-600'    },
        { label: 'Active',        value: users.filter((u) => (u.status || 'active') === 'active').length.toString(), color: 'text-emerald-600' },
        { label: 'Suspended',     value: users.filter((u) => u.status === 'suspended' || u.status === 'banned').length.toString(), color: 'text-red-500' },
        { label: 'Admins',        value: users.filter((u) => u.role === 'admin').length.toString(),                  color: 'text-purple-600'  },
    ];

    if (loading) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Users" subtitle="Manage all platform users" />
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500">Loading users…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col">
                <TopHeader title="Users" subtitle="Manage all platform users" />
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={fetchUsers} className="mt-3 text-sm text-red-600 underline">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <TopHeader title="Users" subtitle="Manage all platform users" />

            <div className="p-4 space-y-3">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((s) => (
                        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                            <p className="text-[11px] text-gray-500 mb-1 leading-none">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            All Users
                            <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-52"
                                />
                            </div>

                            {/* Status filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
                            >
                                {statusFilters.map((f) => (
                                    <option key={f} value={f}>
                                        {f === 'All' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </option>
                                ))}
                            </select>

                            {/* Role filter */}
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
                            >
                                {roleFilters.map((f) => (
                                    <option key={f} value={f}>
                                        {f === 'All' ? 'All Roles' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <AdminTable
                        columns={columns}
                        data={filtered}
                        actions={[
                            { 
                                label: (row) => row.role === 'admin' ? 'Demote' : 'Promote',
                                variant: (row) => row.role === 'admin' ? 'default' : 'primary', 
                                disabled: (row) => row.id === currentUser?.id,
                                onClick: handlePromote 
                            },
                            { 
                                label: (row) => (row.status || 'active') === 'active' ? 'Suspend' : 'Activate', 
                                variant: (row) => (row.status || 'active') === 'active' ? 'danger' : 'primary', 
                                disabled: (row) => row.id === currentUser?.id,
                                onClick: handleSuspend 
                            },
                        ]}
                        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
                        emptyMessage="No users match your search."
                    />
                </div>
            </div>

            {modalConfig && (
                <ConfirmationModal
                    isOpen={!!modalConfig}
                    onClose={() => setModalConfig(null)}
                    onConfirm={handleConfirmAction}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    confirmText={modalConfig.confirmText}
                    variant={modalConfig.variant}
                    isLoading={isActionLoading}
                />
            )}
        </div>
    );
};

export default AdminUsers;

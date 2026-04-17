import React, { useState, useEffect } from 'react';
import { Search, Shield, ShieldCheck, ShieldX, UserX, UserCheck as UserCheckIcon, Loader2, CheckCircle, AlertTriangle, X, Ban } from 'lucide-react';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

const ConfirmModal = ({ open, title, message, variant = 'danger', onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${
                            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserRoles = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState({ open: false, title: '', message: '', action: null, variant: 'danger' });
    const [actionLoading, setActionLoading] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/users');
            setUsers(data.users || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRoleChange = (user, newRole) => {
        if (user.role === newRole) return;
        setModal({
            open: true,
            title: newRole === 'admin' ? 'Promote to Admin' : 'Demote to User',
            message: `Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} "${user.full_name || user.email}" to ${newRole}? This will change their access level across the platform.`,
            variant: newRole === 'admin' ? 'primary' : 'danger',
            action: async () => {
                setActionLoading(true);
                try {
                    await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                    showToast('success', `${user.full_name || user.email} is now ${newRole}`);
                } catch (err) {
                    showToast('error', err.message || 'Failed to update role');
                } finally {
                    setActionLoading(false);
                    setModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleStatusChange = (user, newStatus) => {
        if (user.status === newStatus) return;
        const labels = { active: 'Activate', suspended: 'Suspend', banned: 'Ban' };
        setModal({
            open: true,
            title: `${labels[newStatus]} User`,
            message: newStatus === 'active'
                ? `Re-activate "${user.full_name || user.email}"? They'll regain full platform access.`
                : `${labels[newStatus]} "${user.full_name || user.email}"? ${newStatus === 'banned' ? 'They will lose all access and their sessions will be terminated.' : 'Their active sessions will be terminated.'}`,
            variant: newStatus === 'active' ? 'primary' : 'danger',
            action: async () => {
                setActionLoading(true);
                try {
                    await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                    showToast('success', `User ${newStatus === 'active' ? 'activated' : newStatus}`);
                } catch (err) {
                    showToast('error', err.message || 'Failed to update status');
                } finally {
                    setActionLoading(false);
                    setModal(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const filtered = users.filter(u => {
        const matchSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const statusColors = { active: 'bg-emerald-50 text-emerald-700', suspended: 'bg-amber-50 text-amber-700', banned: 'bg-red-50 text-red-700' };
    const roleColors = { admin: 'bg-purple-50 text-purple-700', user: 'bg-gray-100 text-gray-700' };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Loading users…</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: users.length, color: 'text-blue-600' },
                    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
                    { label: 'Active', value: users.filter(u => (u.status || 'active') === 'active').length, color: 'text-emerald-600' },
                    { label: 'Suspended', value: users.filter(u => u.status === 'suspended' || u.status === 'banned').length, color: 'text-red-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* User Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                        All Users <span className="ml-1 text-xs text-gray-400">({filtered.length})</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
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
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
                                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {(user.full_name || user.email || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{user.full_name || '—'}</p>
                                                    {user.id === currentUser?.id && (
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
                                            {user.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[user.status || 'active']}`}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                                disabled={user.id === currentUser?.id}
                                                className={`px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
                                                    user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-300'
                                                }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            
                                            {(user.status || 'active') === 'active' ? (
                                                <button
                                                    onClick={() => handleStatusChange(user, 'suspended')}
                                                    disabled={user.id === currentUser?.id}
                                                    className={`relative group/btn flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md transition-all ${
                                                        user.id === currentUser?.id ? 'opacity-40 cursor-not-allowed' : 'hover:bg-amber-100'
                                                    }`}
                                                    title={user.id === currentUser?.id ? "Cannot suspend yourself" : "Suspend user"}
                                                >
                                                    {user.id === currentUser?.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity bg-white/10 rounded-md pointer-events-none">
                                                            <Ban size={12} className="text-red-500 stroke-[3]" />
                                                        </div>
                                                    )}
                                                    <span className={user.id === currentUser?.id ? 'group-hover/btn:invisible flex items-center gap-1' : 'flex items-center gap-1'}>
                                                        <UserX size={12} /> Suspend
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(user, 'active')}
                                                    disabled={user.id === currentUser?.id}
                                                    className={`relative group/btn flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md transition-all ${
                                                        user.id === currentUser?.id ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-100'
                                                    }`}
                                                    title={user.id === currentUser?.id ? "Cannot activate yourself" : "Activate user"}
                                                >
                                                    {user.id === currentUser?.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity bg-white/10 rounded-md pointer-events-none">
                                                            <Ban size={12} className="text-red-500 stroke-[3]" />
                                                        </div>
                                                    )}
                                                    <span className={user.id === currentUser?.id ? 'group-hover/btn:invisible flex items-center gap-1' : 'flex items-center gap-1'}>
                                                        <UserCheckIcon size={12} /> Activate
                                                    </span>
                                                </button>
                                            )}

                                            {user.status !== 'banned' && (
                                                <button
                                                    onClick={() => handleStatusChange(user, 'banned')}
                                                    disabled={user.id === currentUser?.id}
                                                    className={`relative group/btn flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md transition-all ${
                                                        user.id === currentUser?.id ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-100'
                                                    }`}
                                                    title={user.id === currentUser?.id ? "Cannot ban yourself" : "Ban user"}
                                                >
                                                    {user.id === currentUser?.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity bg-white/10 rounded-md pointer-events-none">
                                                            <Ban size={12} className="text-red-500 stroke-[3]" />
                                                        </div>
                                                    )}
                                                    <span className={user.id === currentUser?.id ? 'group-hover/btn:invisible flex items-center gap-1' : 'flex items-center gap-1'}>
                                                        <ShieldX size={12} /> Ban
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                onConfirm={modal.action}
                onCancel={() => setModal(prev => ({ ...prev, open: false }))}
                loading={actionLoading}
            />
        </div>
    );
};

export default UserRoles;

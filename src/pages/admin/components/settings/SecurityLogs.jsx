import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Search, ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertTriangle, X, Clock, User, Activity } from 'lucide-react';
import api from '../../../../lib/api';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading }) => {
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
                    <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Force Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

const actionColors = {
    UPDATE_PLATFORM_CONFIG: 'bg-blue-50 text-blue-700',
    UPDATE_MODULE_PRICING: 'bg-indigo-50 text-indigo-700',
    UPDATE_USER_ROLE: 'bg-purple-50 text-purple-700',
    UPDATE_USER_STATUS: 'bg-amber-50 text-amber-700',
    UPDATE_SUBSCRIPTION: 'bg-teal-50 text-teal-700',
    ISSUE_REFUND: 'bg-red-50 text-red-700',
    UPDATE_NOTIFICATION_SETTINGS: 'bg-sky-50 text-sky-700',
    BROADCAST_NOTIFICATION: 'bg-orange-50 text-orange-700',
    FORCE_LOGOUT: 'bg-rose-50 text-rose-700',
    UPDATE_SETTINGS: 'bg-gray-100 text-gray-700',
};

const SecurityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [toast, setToast] = useState(null);
    const [actionFilter, setActionFilter] = useState('');
    const [logoutModal, setLogoutModal] = useState({ open: false, userId: null, userName: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const limit = 20;

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let query = `/admin/audit-logs?page=${page}&limit=${limit}`;
            if (actionFilter) query += `&action_type=${actionFilter}`;
            const data = await api.get(query);
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (err) {
            showToast('error', 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleForceLogout = async () => {
        setActionLoading(true);
        try {
            await api.post(`/admin/force-logout/${logoutModal.userId}`);
            showToast('success', `Sessions terminated for ${logoutModal.userName}`);
            setLogoutModal({ open: false, userId: null, userName: '' });
            fetchLogs(); // Refresh to show the new audit log
        } catch (err) {
            showToast('error', err.message || 'Failed to force logout');
        } finally {
            setActionLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    const formatAction = (action) => {
        return (action || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '—';
        const d = new Date(timestamp);
        return d.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // Get unique users from logs for force-logout
    const uniqueUsers = [...new Map(
        logs.filter(l => l.user_email).map(l => [l.user_id, { id: l.user_id, email: l.user_email, name: l.user_name }])
    ).values()];

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Force Logout Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <LogOut size={18} className="text-red-500" />
                        <h3 className="text-base font-bold text-gray-900">Force Logout</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Terminate all active sessions for a user</p>
                </div>
                <div className="p-6">
                    {uniqueUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {uniqueUsers.slice(0, 9).map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.name || '—'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLogoutModal({ open: true, userId: user.id, userName: user.name || user.email })}
                                        className="shrink-0 ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Force logout"
                                    >
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">No users found in recent audit logs.</p>
                    )}
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                            Audit Trail <span className="ml-1 text-xs text-gray-400">({total})</span>
                        </h3>
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-600"
                    >
                        <option value="">All Actions</option>
                        <option value="UPDATE_PLATFORM_CONFIG">Platform Config</option>
                        <option value="UPDATE_MODULE_PRICING">Module Pricing</option>
                        <option value="UPDATE_USER_ROLE">User Role Change</option>
                        <option value="UPDATE_USER_STATUS">User Status Change</option>
                        <option value="UPDATE_SUBSCRIPTION">Subscription Update</option>
                        <option value="ISSUE_REFUND">Refund</option>
                        <option value="BROADCAST_NOTIFICATION">Broadcast</option>
                        <option value="FORCE_LOGOUT">Force Logout</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-500">Loading logs…</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Timestamp</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Admin</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Entity</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-600">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Clock size={13} className="shrink-0" />
                                                    <span className="text-xs">{formatTime(log.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
                                                        {(log.user_name || log.user_email || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-700 text-xs">{log.user_email || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action_type] || 'bg-gray-100 text-gray-700'}`}>
                                                    {formatAction(log.action_type)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 text-xs">
                                                {log.entity_type || '—'}
                                                {log.entity_id && <span className="ml-1 text-gray-400">({log.entity_id.slice(0, 8)}…)</span>}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">
                                                {log.ip_address || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500">
                                    Page {page} of {totalPages} ({total} total)
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1.5 text-gray-500 hover:bg-white rounded-md transition-colors disabled:opacity-40"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-8 h-8 text-xs font-medium rounded-md transition-colors ${
                                                    page === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-1.5 text-gray-500 hover:bg-white rounded-md transition-colors disabled:opacity-40"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Force Logout Modal */}
            <ConfirmModal
                open={logoutModal.open}
                title="Force Logout User"
                message={`Terminate all active sessions for "${logoutModal.userName}"? They will be signed out on all devices and must log in again.`}
                onConfirm={handleForceLogout}
                onCancel={() => setLogoutModal({ open: false, userId: null, userName: '' })}
                loading={actionLoading}
            />
        </div>
    );
};

export default SecurityLogs;

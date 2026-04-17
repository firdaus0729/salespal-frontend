import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, ArrowUpDown, Loader2, CheckCircle, AlertTriangle, X, DollarSign } from 'lucide-react';
import api from '../../../../lib/api';

const ConfirmModal = ({ open, title, children, variant = 'danger', confirmLabel = 'Confirm', onConfirm, onCancel, loading }) => {
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
                <div className="px-6 py-5">{children}</div>
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
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

const BillingControl = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusModal, setStatusModal] = useState({ open: false, sub: null, newStatus: '' });
    const [refundModal, setRefundModal] = useState({ open: false, sub: null, amount: '', reason: '' });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/subscriptions');
            setSubscriptions(data.subscriptions || []);
        } catch (err) {
            showToast('error', 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleStatusUpdate = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/subscriptions/${statusModal.sub.id}`, { status: statusModal.newStatus });
            setSubscriptions(prev => prev.map(s =>
                s.id === statusModal.sub.id ? { ...s, status: statusModal.newStatus } : s
            ));
            showToast('success', `Subscription ${statusModal.newStatus}`);
            setStatusModal({ open: false, sub: null, newStatus: '' });
        } catch (err) {
            showToast('error', err.message || 'Failed to update subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!refundModal.amount || parseFloat(refundModal.amount) <= 0) {
            showToast('error', 'Enter a valid refund amount');
            return;
        }
        setActionLoading(true);
        try {
            await api.post('/admin/refund', {
                subscription_id: refundModal.sub.id,
                amount: parseFloat(refundModal.amount),
                reason: refundModal.reason
            });
            showToast('success', `Refund of ₹${refundModal.amount} issued`);
            setRefundModal({ open: false, sub: null, amount: '', reason: '' });
        } catch (err) {
            showToast('error', err.message || 'Failed to issue refund');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Loading subscriptions…</span>
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
                    { label: 'Total Subscriptions', value: subscriptions.length, color: 'text-blue-600' },
                    { label: 'Active', value: subscriptions.filter(s => s.status === 'active').length, color: 'text-emerald-600' },
                    { label: 'Paused', value: subscriptions.filter(s => s.status === 'paused').length, color: 'text-amber-600' },
                    { label: 'Inactive', value: subscriptions.filter(s => s.status === 'inactive').length, color: 'text-gray-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Subscription Management <span className="ml-1 text-xs text-gray-400">({subscriptions.length})</span>
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Organization</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Module</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Since</th>
                                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {subscriptions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-gray-900">
                                        {sub.organization_name || '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">
                                        {sub.user_email || sub.user_name || '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                            {sub.module}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[sub.status] || statusColors.inactive}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500">
                                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {sub.status !== 'active' && (
                                                <button
                                                    onClick={() => setStatusModal({ open: true, sub, newStatus: 'active' })}
                                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                                                >
                                                    <CheckCircle size={12} /> Activate
                                                </button>
                                            )}
                                            {sub.status === 'active' && (
                                                <button
                                                    onClick={() => setStatusModal({ open: true, sub, newStatus: 'paused' })}
                                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                                                >
                                                    <ArrowUpDown size={12} /> Pause
                                                </button>
                                            )}
                                            {sub.status !== 'inactive' && (
                                                <button
                                                    onClick={() => setStatusModal({ open: true, sub, newStatus: 'inactive' })}
                                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                                >
                                                    <X size={12} /> Deactivate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setRefundModal({ open: true, sub, amount: '', reason: '' })}
                                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                                            >
                                                <RefreshCw size={12} /> Refund
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Change Modal */}
            <ConfirmModal
                open={statusModal.open}
                title={`${statusModal.newStatus === 'active' ? 'Activate' : statusModal.newStatus === 'paused' ? 'Pause' : 'Deactivate'} Subscription`}
                variant={statusModal.newStatus === 'active' ? 'primary' : 'danger'}
                confirmLabel={statusModal.newStatus === 'active' ? 'Activate' : statusModal.newStatus === 'paused' ? 'Pause' : 'Deactivate'}
                onConfirm={handleStatusUpdate}
                onCancel={() => setStatusModal({ open: false, sub: null, newStatus: '' })}
                loading={actionLoading}
            >
                <p className="text-sm text-gray-600">
                    {statusModal.newStatus === 'active'
                        ? `Activate the ${statusModal.sub?.module} subscription for "${statusModal.sub?.organization_name}"?`
                        : statusModal.newStatus === 'paused'
                            ? `Pause the ${statusModal.sub?.module} subscription for "${statusModal.sub?.organization_name}"? They'll temporarily lose module access.`
                            : `Deactivate the ${statusModal.sub?.module} subscription for "${statusModal.sub?.organization_name}"? This will fully terminate their access.`
                    }
                </p>
            </ConfirmModal>

            {/* Refund Modal */}
            <ConfirmModal
                open={refundModal.open}
                title="Issue Refund"
                variant="danger"
                confirmLabel="Issue Refund"
                onConfirm={handleRefund}
                onCancel={() => setRefundModal({ open: false, sub: null, amount: '', reason: '' })}
                loading={actionLoading}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Issue a refund for the <strong>{refundModal.sub?.module}</strong> subscription of <strong>{refundModal.sub?.organization_name}</strong>.
                    </p>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Amount (₹)</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={refundModal.amount}
                                onChange={(e) => setRefundModal(prev => ({ ...prev, amount: e.target.value }))}
                                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter refund amount"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Reason (optional)</label>
                        <textarea
                            value={refundModal.reason}
                            onChange={(e) => setRefundModal(prev => ({ ...prev, reason: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Reason for refund…"
                        />
                    </div>
                </div>
            </ConfirmModal>
        </div>
    );
};

export default BillingControl;

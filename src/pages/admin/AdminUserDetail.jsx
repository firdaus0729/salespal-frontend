import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Mail, Calendar, Shield, Activity, 
  AlertTriangle, CheckCircle2, Building2, Lock, Ban, PauseCircle
} from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric } from './components/DetailLayout';

const statusStyles = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    suspended: 'bg-amber-100 text-amber-700 border-amber-200',
    banned: 'bg-red-100 text-red-700 border-red-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200'
};

const AdminUserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const [modalConfig, setModalConfig] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/admin/users`);
            const foundUser = data.users?.find(u => u.id === id);
            if (!foundUser) throw new Error('User not found');
            setUser(foundUser);
        } catch (err) {
            setError(err.message || 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = (newRole) => {
        const actionStr = newRole === 'admin' ? 'Promote' : 'Demote';
        setModalConfig({
            type: 'role',
            newValue: newRole,
            title: `${actionStr} User`,
            message: `Are you sure you want to ${actionStr.toLowerCase()} this user?`,
            confirmText: actionStr,
            variant: 'primary'
        });
    };

    const handleUpdateStatus = (newStatus) => {
        const label = newStatus === 'suspended' ? 'Suspend' : newStatus === 'banned' ? 'Ban' : 'Reactivate';
        setModalConfig({
            type: 'status',
            newValue: newStatus,
            title: `${label} User`,
            message: `Are you sure you want to ${label.toLowerCase()} this user?`,
            confirmText: label,
            variant: newStatus === 'active' ? 'primary' : 'danger'
        });
    };

    const handleConfirmAction = async () => {
        if (!modalConfig) return;
        const { type, newValue } = modalConfig;
        
        try {
            setIsActionLoading(true);
            const endpoint = type === 'role' ? 'role' : 'status';
            const payload = type === 'role' ? { role: newValue } : { status: newValue };
            
            const res = await api.patch(`/admin/users/${id}/${endpoint}`, payload);
            setUser(res.user);
            
            showToast({
                title: 'Success',
                description: `User ${type} updated successfully.`,
                variant: 'success'
            });
        } catch (err) {
            showToast({
                title: 'Failed',
                description: err.message || `Failed to update user ${type}.`,
                variant: 'error'
            });
        } finally {
            setIsActionLoading(false);
            setModalConfig(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <span className="text-gray-500">Loading user...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-red-500">
                <AlertTriangle size={36} className="mb-4" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    const uStatus = user.status || 'active';
    const sStyle = statusStyles[uStatus] || statusStyles.inactive;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <BaseDetailLayout backUrl="/admin/users" backLabel="Back to Users">
            <DetailHeader 
                title={user.full_name || 'Unnamed User'}
                subtitle={user.email}
                icon={Mail}
                badge={
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${sStyle}`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                        {uStatus}
                    </span>
                }
            />

            <DetailGrid>
                {/* 🟩 LEFT SECTION (8 Cols) */}
                <LeftColumn>
                    
                    {/* Section 1: Overview Card */}
                    <DetailCard title="User Overview" icon={User}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <DetailMetric label="Full Name" value={user.full_name || '—'} />
                            <DetailMetric label="Email Address" value={user.email} />
                            <DetailMetric 
                                label="Platform Role" 
                                value={
                                    <span className="flex items-center gap-1">
                                        <Shield size={14} className={user.role === 'admin' ? "text-purple-500" : "text-gray-400"} />
                                        <span className="capitalize">{user.role || 'user'}</span>
                                    </span>
                                } 
                            />
                            <DetailMetric label="Joined Date" value={formatDate(user.created_at)} />
                        </div>
                    </DetailCard>

                    {/* Section 2: Organization Info */}
                    <DetailCard title="Organizational Details" icon={Building2}>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <DetailMetric label="Organization Name" value={user.organization_name || 'No Organization'} />
                             <DetailMetric label="Workspace Association" value="Primary Member" />
                         </div>
                    </DetailCard>

                    {/* Section 3: Activity Timeline */}
                    <DetailCard title="Account Activity" icon={Activity}>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={14} className="text-gray-500" />
                                </div>
                                <div className="w-px h-12 bg-gray-100 my-1"></div>
                            </div>
                            <div className="pt-1 w-full">
                                <p className="text-sm font-semibold text-gray-900">Account Created</p>
                                <p className="text-xs text-gray-500 my-0.5">User officially onboarded on the platform.</p>
                                <p className="text-[11px] text-gray-400 font-medium font-mono mt-1">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </DetailCard>

                </LeftColumn>

                {/* 🟨 RIGHT SECTION (4 Cols) */}
                <RightColumn>
                    
                    {/* 1. Status Card */}
                    <DetailCard title="Account Status" icon={Shield}>
                        <div className="flex flex-col gap-4">
                            <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 border ${sStyle}`}>
                                <div className={`w-2 h-2 rounded-full bg-current`} />
                                {uStatus}
                            </div>
                            <p className="text-xs text-gray-500 text-center leading-relaxed">
                                {uStatus === 'active' 
                                    ? "This user has full access to their permitted modules."
                                    : "This user has been restricted from accessing the platform."
                                }
                            </p>
                        </div>
                    </DetailCard>

                    {/* 2. Summary Card */}
                    <DetailCard title="Profile Context" icon={Shield}>
                        <div className="space-y-4">
                             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <span className="text-xs font-semibold text-gray-500">Security Level</span>
                                 <span className="text-xs font-bold text-gray-900 uppercase">{user.role}</span>
                             </div>
                             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <span className="text-xs font-semibold text-gray-500">Auth Method</span>
                                 <span className="text-xs font-bold text-gray-900 uppercase">Password / Token</span>
                             </div>
                        </div>
                    </DetailCard>

                    {/* 3. Quick Actions (STICKY) */}
                    <div className="sticky top-6">
                        <DetailCard title="Account Actions" icon={Lock} className="border-red-100">
                            <div className="flex flex-col gap-3">
                                {user.role === 'admin' ? (
                                    <button 
                                        onClick={() => handleUpdateRole('user')}
                                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2"
                                    >
                                        <Shield size={16} /> Demote to Normal User
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpdateRole('admin')}
                                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-blue-700 bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2"
                                    >
                                        <Shield size={16} /> Promote to Administrator
                                    </button>
                                )}
                                
                                <div className="h-px bg-gray-100 w-full my-1" />

                                {uStatus === 'active' ? (
                                    <button 
                                        onClick={() => handleUpdateStatus('suspended')}
                                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-2"
                                    >
                                        <PauseCircle size={16} /> Suspend Account
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpdateStatus('active')}
                                        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Reactivate Account
                                    </button>
                                )}

                                <button 
                                    onClick={() => handleUpdateStatus('banned')}
                                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 mt-1 flex items-center justify-center gap-2 border border-red-200"
                                >
                                    <Ban size={16} /> Ban User
                                </button>
                            </div>
                        </DetailCard>
                    </div>

                </RightColumn>
            </DetailGrid>

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
        </BaseDetailLayout>
    );
};

export default AdminUserDetail;

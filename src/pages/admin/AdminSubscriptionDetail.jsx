import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CreditCard, Building2, Calendar, Target, Activity, Settings, 
  AlertTriangle, PlaySquare, PauseCircle, ChevronRight, Receipt, ArrowUpCircle
} from 'lucide-react';
import api from '../../lib/api';
import { BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric } from './components/DetailLayout';

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
};

const AdminSubscriptionDetail = () => {
  const { id } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/subscriptions');
      const found = (data.subscriptions || []).find(s => s.id === id);
      if (found) {
        setSubscription(found);
      } else {
        setError('Subscription not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/admin/subscriptions/${subscription.id}`, { status: newStatus });
      setSubscription({ ...subscription, status: newStatus });
    } catch (err) {
      alert(err.message || 'Error changing subscription status');
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center py-32">
              <span className="text-gray-500">Loading subscription...</span>
          </div>
      );
  }

  if (error || !subscription) {
      return (
          <div className="flex flex-col items-center justify-center py-32 text-red-500">
              <AlertTriangle size={36} className="mb-4" />
              <p className="font-semibold">{error || 'Subscription not found'}</p>
          </div>
      );
  }

  const subStatus = subscription.status || 'inactive';
  const sStyle = statusStyles[subStatus] || statusStyles.inactive;
  const formatDate = (dateString, addDays = 0) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (addDays) d.setDate(d.getDate() + addDays);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <BaseDetailLayout backUrl="/admin/subscriptions" backLabel="Back to Subscriptions">
      
      <DetailHeader 
        title={subscription.organization_name || subscription.user_email || 'Unnamed Details'}
        subtitle={subscription.module ? `${subscription.module.charAt(0).toUpperCase()}${subscription.module.slice(1)} Module` : 'Platform Plan'}
        icon={CreditCard}
        badge={
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${sStyle}`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
              {subStatus}
          </span>
        }
      />

      <DetailGrid>
        {/* 🟩 LEFT SECTION (8 Cols) */}
        <LeftColumn>
          
          {/* Section 1: Overview */}
          <DetailCard title="Subscription Profile" icon={Target}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <DetailMetric 
                  label="Module Attached" 
                  value={<span className="capitalize">{subscription.module || '—'}</span>} 
              />
              <DetailMetric label="Organization" value={subscription.organization_name || '—'} />
              <DetailMetric label="Customer / User Email" value={subscription.user_email || '—'} />
              <DetailMetric label="Initial Activation" value={formatDate(subscription.activated_at || subscription.created_at)} />
            </div>
          </DetailCard>

          {/* Section 2: Billing Details */}
          <DetailCard title="Billing Details" icon={Receipt}>
            <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
              <div className="pl-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {subscription.module || '—'}
                </p>
              </div>
              <div className="px-6 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Billing Cycle</p>
                <p className="text-2xl font-bold text-gray-900">Monthly</p>
              </div>
              <div className="px-6 text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Renewal</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatDate(subscription.activated_at || subscription.created_at, 30)}
                </p>
              </div>
            </div>
          </DetailCard>

          {/* Section 3: Activity Timeline */}
          <DetailCard title="Recent Payments & Actions" icon={Activity}>
             <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                   <Receipt size={14} className="text-emerald-600" />
                 </div>
                 <div className="w-px h-12 bg-gray-200 my-1"></div>
               </div>
               <div className="pt-1 w-full flex justify-between pr-4 items-start">
                 <div>
                   <p className="text-sm font-semibold text-gray-900">Invoice Paid</p>
                   <p className="text-xs text-gray-500 my-0.5">Automated charge succeeded ($59.00)</p>
                   <p className="text-[11px] text-gray-400 font-medium font-mono mt-1">
                     {formatDate(subscription.activated_at || subscription.created_at)}
                   </p>
                 </div>
                 <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 border-b border-transparent hover:border-blue-600 pb-0.5 transition-all">
                   View Receipt
                 </button>
               </div>
             </div>
          </DetailCard>

        </LeftColumn>

        {/* 🟨 RIGHT SECTION (4 Cols) */}
        <RightColumn>
          
          {/* 1. Status Card */}
          <DetailCard title="Subscription Access" icon={Target}>
             <div className="flex flex-col gap-4">
                 <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 border ${sStyle}`}>
                     <div className={`w-2 h-2 rounded-full bg-current`} />
                     {subStatus}
                 </div>
                 <div className="flex flex-col gap-2 mt-2">
                    {subStatus === 'active' ? (
                      <button 
                        onClick={() => handleUpdateStatus('paused')}
                        className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                      >
                        <PauseCircle size={16} /> Pause Subscription
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus('active')}
                        className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                      >
                        <PlaySquare size={16} /> Reactivate Access
                      </button>
                    )}
                 </div>
             </div>
          </DetailCard>

          {/* 2. Workspace Entity */}
          <DetailCard title="Workspace Entity" icon={Building2}>
             <p className="text-sm font-medium text-gray-900 mb-2">{subscription.organization_name || 'No Org Details'}</p>
             <button 
               onClick={() => alert(`View ${subscription.organization_name} Details`)}
               className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
             >
               View Organization <ChevronRight size={14} className="mt-px ml-1" />
             </button>
          </DetailCard>

          {/* 3. Actions Panel (Sticky) */}
          <div className="sticky top-6">
             <DetailCard title="Subscription Actions" icon={Settings}>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => alert('Billing History portal loading...')}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Receipt size={16} /> All Invoices
                  </button>
                  
                  <div className="w-full h-px bg-gray-100 my-2"></div>
                  
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you absolutely sure you want to cancel this user\'s access to the module immediately?')) {
                         alert('Subscription successfully flagged for cancellation');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 mt-1 flex items-center justify-center gap-2 border border-red-100"
                  >
                    <AlertTriangle size={16} /> Cancel Subscription
                  </button>
               </div>
             </DetailCard>
          </div>

        </RightColumn>
      </DetailGrid>
    </BaseDetailLayout>
  );
};

export default AdminSubscriptionDetail;

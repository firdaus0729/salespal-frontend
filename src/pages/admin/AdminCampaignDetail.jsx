import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Megaphone, Building2, Target, Activity, BarChart3, Settings, AlertTriangle,
  PlaySquare, PauseCircle, CheckCircle2, Eye, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import { BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric } from './components/DetailLayout';

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const AdminCampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/campaigns');
      const found = (data.campaigns || []).find(c => c.id === id);
      if (found) setCampaign(found);
      else setError('Campaign not found');
    } catch (err) {
      setError(err.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setCampaign({ ...campaign, status: newStatus });
    } catch (err) {
      alert(err.message || 'Error changing status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-gray-500">Loading campaign...</span>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-red-500">
        <AlertTriangle size={36} className="mb-4" />
        <p className="font-semibold">{error || 'Campaign not found'}</p>
      </div>
    );
  }

  const campStatus = campaign.status || 'draft';
  const sStyle = statusStyles[campStatus] || statusStyles.draft;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <BaseDetailLayout backUrl="/admin/campaigns" backLabel="Back to Campaigns">

      <DetailHeader
        title={campaign.name || 'Unnamed Campaign'}
        subtitle={campaign.organization_name || 'No Organization'}
        icon={Megaphone}
        badge={
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${sStyle}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
            {campStatus}
          </span>
        }
      />

      <DetailGrid>
        {/* 🟩 LEFT SECTION (8 Cols) */}
        <LeftColumn>

          {/* Section 1: Overview */}
          <DetailCard title="Campaign Overview" icon={Target}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <DetailMetric label="Campaign Name" value={campaign.name} />
              <DetailMetric label="Organization" value={campaign.organization_name || '—'} />
              <DetailMetric label="Target Platform" value={<span className="capitalize">{campaign.platform || '—'}</span>} />
              <DetailMetric label="Created Date" value={formatDate(campaign.created_at)} />
            </div>
          </DetailCard>

          {/* Section 2: Ad Performance */}
          <DetailCard title="Ad Performance" icon={BarChart3}>
            <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
              <div className="pl-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Impressions</p>
                <p className="text-2xl font-bold text-gray-900 flex items-end gap-2">
                  0 <span className="text-xs text-blue-500 font-bold mb-1">+0%</span>
                </p>
              </div>
              <div className="px-6 text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="px-6 text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conversions</p>
                <p className="text-2xl font-bold text-emerald-600">0 <span className="text-xs text-gray-400 font-normal mb-1">leads</span></p>
              </div>
            </div>
          </DetailCard>

          {/* Section 3: Activity Timeline */}
          <DetailCard title="Recent Activity" icon={Activity}>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} className="text-blue-600" />
                </div>
                <div className="w-px h-12 bg-gray-100 my-1"></div>
              </div>
              <div className="pt-1 w-full">
                <p className="text-sm font-semibold text-gray-900">Campaign Published</p>
                <p className="text-xs text-gray-500 my-0.5">Campaign synced and live on the designated platform.</p>
                <p className="text-[11px] text-gray-400 font-medium font-mono mt-1">{formatDate(campaign.created_at)}</p>
              </div>
            </div>
          </DetailCard>

        </LeftColumn>

        {/* 🟨 RIGHT SECTION (4 Cols) */}
        <RightColumn>

          {/* 1. Status Card */}
          <DetailCard title="Current Status" icon={Target}>
            <div className="flex flex-col gap-4">
              <div className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 border ${sStyle}`}>
                <div className={`w-2 h-2 rounded-full bg-current`} />
                {campStatus}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {campStatus === 'active' ? (
                  <button
                    onClick={() => handleUpdateStatus('paused')}
                    className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                  >
                    <PauseCircle size={16} /> Pause Campaign
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('active')}
                    className="w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <PlaySquare size={16} /> Run Campaign
                  </button>
                )}
              </div>
            </div>
          </DetailCard>

          {/* 2. Organization Info */}
          <DetailCard title="Workspace Entity" icon={Building2}>
            <p className="text-sm font-medium text-gray-900 mb-2">{campaign.organization_name || 'No Org Details'}</p>
            <button
              onClick={() => alert(`View ${campaign.organization_name} Details`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              View Organization Profile <ChevronRight size={14} className="mt-px ml-1" />
            </button>
          </DetailCard>

          {/* 3. Actions Panel (Sticky) */}
          <div className="sticky top-6">
            <DetailCard title="Campaign Actions" icon={Settings}>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => alert('View Live Ad Metrics...')}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> View External Preview
                </button>

                <button
                  onClick={() => alert('Editing budget parameters...')}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Settings size={16} /> Configuration
                </button>

                <div className="w-full h-px bg-gray-100 my-2"></div>

                <button
                  onClick={() => {
                    if (window.confirm('Delete campaign permanently?')) alert('Campaign mapped for deletion');
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 flex items-center justify-center gap-2 border border-red-100"
                >
                  <AlertTriangle size={16} /> Delete Campaign
                </button>
              </div>
            </DetailCard>
          </div>

        </RightColumn>
      </DetailGrid>
    </BaseDetailLayout>
  );
};

export default AdminCampaignDetail;

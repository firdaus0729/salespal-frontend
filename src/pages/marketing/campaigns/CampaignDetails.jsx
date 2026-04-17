import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Pause, Play, Edit, AlertTriangle, TrendingUp, TrendingDown,
    Target, Users, MousePointerClick, Activity, ChevronDown,
    ChevronUp, Facebook, Chrome, Linkedin, Smartphone, Monitor, Tablet,
    Eye, CheckCircle, XCircle, ArrowRight, X, RefreshCw, Megaphone, Settings
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ComposedChart, Line
} from 'recharts';
import { useMarketing } from '../../../context/MarketingContext';
import { useIntegrations } from '../../../context/IntegrationContext';
import { useSales } from '../../../context/SalesContext';
import { canLaunchCampaign } from '../../../utils/campaignGuard';
import { getProjectsBackRoute, getCampaignEditRoute } from '../../../utils/navigationUtils';
import { usePreferences } from '../../../context/PreferencesContext';
import CurrencyIcon from '../../../components/ui/CurrencyIcon';
import PlatformPublishStatus from '../../../components/campaigns/PlatformPublishStatus';
import api from '../../../lib/api';

import { 
  BaseDetailLayout, DetailHeader, DetailGrid, LeftColumn, RightColumn, DetailCard, DetailMetric 
} from '../../admin/components/DetailLayout';

// ============================================
// DECISION-FIRST CAMPAIGN CONTROL PANEL
// ============================================

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-xs">
                <p className="font-semibold text-gray-900 mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-gray-500 capitalize">{entry.name}:</span>
                        <span className="font-semibold text-gray-900">
                            {entry.name === 'ROAS' ? `${entry.value}x` :
                                entry.name === 'CPA' ? (formatCurrency ? formatCurrency(entry.value) : entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const getCampaignHealth = (roas, cpa, spend, revenue) => {
    if (spend > 500 && revenue === 0) return { status: 'burning', color: 'bg-red-500', textColor: 'text-red-600', label: 'BURNING', action: 'Pause immediately' };
    if (roas < 1.5) return { status: 'at-risk', color: 'bg-amber-500', textColor: 'text-amber-600', label: 'AT RISK', action: 'Review targeting' };
    if (roas >= 3) return { status: 'healthy', color: 'bg-emerald-500', textColor: 'text-emerald-600', label: 'HEALTHY', action: 'Consider scaling' };
    return { status: 'stable', color: 'bg-blue-500', textColor: 'text-blue-600', label: 'STABLE', action: 'Monitor performance' };
};

export default function CampaignDetails() {
    const { projectId, campaignId } = useParams();
    const navigate = useNavigate();
    const { getCampaignById, updateCampaign } = useMarketing();
    const { integrations } = useIntegrations();
    const { formatCurrency } = usePreferences();
    const { addLead } = useSales();

    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [launchError, setLaunchError] = useState(null);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [activeKPI, setActiveKPI] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);

    useEffect(() => {
        const data = getCampaignById(campaignId);
        setCampaign(data);
        setIsLoading(false);
    }, [campaignId, getCampaignById]);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading campaign control panel...</div>;

    if (!campaign) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block mb-4">Campaign not found</div>
                <button 
                  className="mt-4 px-4 py-2 bg-white text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => navigate(getProjectsBackRoute(projectId))}
                >
                  Back to Projects
                </button>
            </div>
        );
    }

    const { status, name, dailyBudget, platforms } = campaign;
    const isRunning = status === 'active';
    const isPaused = status === 'paused';
    const isDraft = status === 'draft';

    const campaignForGuard = { platforms: platforms || ['facebook', 'google'] };
    const launchCheck = canLaunchCampaign(campaignForGuard, integrations);

    const handleAction = (action) => {
        if (action === 'pause') {
            updateCampaign(campaignId, { status: 'paused' });
            setCampaign(prev => ({ ...prev, status: 'paused' }));
            return;
        }
        if (action === 'resume' || action === 'launch') {
            const check = canLaunchCampaign(campaignForGuard, integrations);
            if (!check.allowed) {
                setLaunchError({ message: `Connect ${check.missing.join(', ')} to ${action}`, missing: check.missing });
                return;
            }
        }
        setLaunchError(null);
        updateCampaign(campaignId, { status: 'active' });
        setCampaign(prev => ({ ...prev, status: 'active' }));
    };

    const handleGenerateLead = () => {
        const leadSources = ['Meta Ads', 'Google Ads', 'Website', 'WhatsApp'];
        const randomSource = leadSources[Math.floor(Math.random() * leadSources.length)];

        addLead({
            name: `Lead from ${name.slice(0, 10)}..._${Math.floor(Math.random() * 1000)}`,
            phone: `+1 555-${Math.floor(1000 + Math.random() * 9000).toString()}`,
            source: randomSource,
            project: `Project ${projectId}`,
            campaign: name,
            assignedTo: 'Unassigned'
        });
        alert('Test lead generated and added to Sales Module!');
    };

    const handleEdit = () => navigate(getCampaignEditRoute(projectId, campaignId));

    const handleSyncPerformance = async () => {
        setIsSyncing(true);
        setSyncError(null);
        try {
            await api.post(`/marketing/campaigns/${campaignId}/sync-performance`);
            const updated = getCampaignById(campaignId);
            if (updated) setCampaign(updated);
        } catch (err) {
            setSyncError(err?.response?.data?.error?.message || err?.message || 'Sync failed. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const getPlatformIcon = (p) => {
        if (p?.includes('Facebook') || p?.includes('Meta')) return <Facebook className="w-4 h-4 text-[#1877F2]" />;
        if (p?.includes('Google')) return <Chrome className="w-4 h-4 text-[#EA4335]" />;
        if (p?.includes('LinkedIn')) return <Linkedin className="w-4 h-4 text-[#0077B5]" />;
        return null;
    };

    const parseValue = (val) => typeof val === 'number' ? val : parseFloat(String(val || 0).replace(/[^0-9.-]/g, ''));
    const rawSpend = parseValue(campaign.spend);
    const rawRevenue = parseValue(campaign.revenue);
    const rawConversions = parseValue(campaign.conversions);
    const rawClicks = parseValue(campaign.clicks);
    const rawImpressions = parseValue(campaign.impressions);

    const roasValue = rawSpend > 0 ? rawRevenue / rawSpend : 0;
    const cpaValue = rawConversions > 0 ? rawSpend / rawConversions : 0;
    const convValue = rawConversions > 0 ? rawRevenue / rawConversions : 0;
    const ctr = rawImpressions > 0 ? (rawClicks / rawImpressions) * 100 : 0;
    const cvr = rawClicks > 0 ? (rawConversions / rawClicks) * 100 : 0;
    const cpc = rawClicks > 0 ? rawSpend / rawClicks : 0;
    const cpm = rawImpressions > 0 ? (rawSpend / rawImpressions) * 1000 : 0;
    const frequency = campaign.frequency || 1.4;

    const health = getCampaignHealth(roasValue, cpaValue, rawSpend, rawRevenue);

    const efficiencyTrend = [
        { day: 'Mon', roas: 2.1, cpa: 45 },
        { day: 'Tue', roas: 2.3, cpa: 42 },
        { day: 'Wed', roas: 1.9, cpa: 48 },
        { day: 'Thu', roas: 2.5, cpa: 38 },
        { day: 'Fri', roas: 2.8, cpa: 35 },
        { day: 'Sat', roas: 2.6, cpa: 40 },
        { day: 'Sun', roas: roasValue.toFixed(1), cpa: cpaValue.toFixed(0) },
    ];

    const creatives = [
        { id: 1, name: 'Ad Variant A', spend: 3200, ctr: 2.1, cvr: 4.5, conversions: 12, cpa: 267 },
        { id: 2, name: 'Ad Variant B', spend: 5800, ctr: 3.2, cvr: 6.1, conversions: 28, cpa: 207 },
        { id: 3, name: 'Ad Variant C', spend: 3450, ctr: 0.8, cvr: 1.2, conversions: 5, cpa: 690 },
    ].map(c => ({
        ...c,
        tag: c.cvr >= 5 ? 'winner' : c.cvr < 2 ? 'bleeder' : 'neutral'
    })).sort((a, b) => b.conversions - a.conversions);

    const estimatedLeads = Math.round(rawConversions * 2.5);
    const clickToLeadDrop = rawClicks > 0 ? ((rawClicks - estimatedLeads) / rawClicks * 100).toFixed(0) : 0;
    const leadToConvDrop = estimatedLeads > 0 ? ((estimatedLeads - rawConversions) / estimatedLeads * 100).toFixed(0) : 0;

    return (
        <BaseDetailLayout backUrl={getProjectsBackRoute(projectId)} backLabel="Back to Projects">
            
            <DetailHeader 
                title={name}
                subtitle={`Budget: ${typeof dailyBudget === 'number' ? formatCurrency(dailyBudget) : dailyBudget}/day`}
                icon={Megaphone}
                badge={
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border bg-white shadow-sm ring-1 ring-black/5`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${health.color}`} />
                        <span className={health.textColor}>{health.label}</span>
                    </span>
                }
            />

            {launchError && (
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mt-4">
                    <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" /> {launchError.message}
                    </div>
                </div>
            )}

            <DetailGrid>
                {/* 🟩 LEFT SECTION (8 Cols) */}
                <LeftColumn>

                    {/* Section 1: Financial Reality */}
                    <DetailCard title="Financial Reality" icon={CurrencyIcon}>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { label: 'ROAS', kpiKey: 'roas', value: `${roasValue.toFixed(2)}x`, icon: TrendingUp, color: roasValue >= 3 ? 'text-emerald-600' : roasValue >= 2 ? 'text-blue-600' : 'text-red-600', threshold: roasValue >= 3 ? 'Excellent' : roasValue >= 2 ? 'Good' : 'Low' },
                                { label: 'Revenue', kpiKey: 'revenue', value: formatCurrency(rawRevenue), icon: CurrencyIcon, color: 'text-emerald-600', threshold: '' },
                                { label: 'Spend', kpiKey: 'spend', value: formatCurrency(rawSpend), icon: CurrencyIcon, color: 'text-gray-600', threshold: '' },
                                { label: 'CPA', kpiKey: 'cpa', value: formatCurrency(cpaValue), icon: Target, color: cpaValue <= 300 ? 'text-emerald-600' : 'text-amber-600', threshold: cpaValue <= 300 ? 'Efficient' : 'High' },
                                { label: 'Conv. Value', kpiKey: 'convValue', value: formatCurrency(convValue), icon: Users, color: 'text-indigo-600', threshold: '' },
                            ].map((kpi, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveKPI(kpi.kpiKey)}
                                    className={`bg-white border rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group ${activeKPI === kpi.kpiKey ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                                        {kpi.threshold && <span className={`text-[10px] font-medium ${kpi.color}`}>{kpi.threshold}</span>}
                                    </div>
                                    <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                                    <div className="text-xs text-gray-500">{kpi.label}</div>
                                </button>
                            ))}
                        </div>
                    </DetailCard>

                    {/* KPI Insight Panel */}
                    {activeKPI && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 transition-all shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                                        {activeKPI === 'roas' && <TrendingUp className="w-5 h-5 text-white" />}
                                        {activeKPI === 'revenue' && <CurrencyIcon className="w-5 h-5 text-white" />}
                                        {activeKPI === 'spend' && <CurrencyIcon className="w-5 h-5 text-white" />}
                                        {activeKPI === 'cpa' && <Target className="w-5 h-5 text-white" />}
                                        {activeKPI === 'convValue' && <Users className="w-5 h-5 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {activeKPI === 'roas' && 'ROAS Deep Dive'}
                                            {activeKPI === 'revenue' && 'Revenue Breakdown'}
                                            {activeKPI === 'spend' && 'Spend Analysis'}
                                            {activeKPI === 'cpa' && 'CPA Optimization'}
                                            {activeKPI === 'convValue' && 'Conversion Value Insights'}
                                        </h3>
                                        <p className="text-xs text-gray-500">Target Focus Analysis</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveKPI(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-white/50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Insight specifics... skipped for brevity but keeping structure */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-white">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">💡 Strategic Insight</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {activeKPI === 'roas' && (roasValue >= 3 ? 'ROAS exceeds the 3.0x target. Scale budget by 20%.' : 'ROAS is below target. Review underperforming creatives.')}
                                    {activeKPI === 'revenue' && (rawRevenue > rawSpend * 2 ? 'Strong performance. High profit margin detected.' : 'Focus on conversion rate optimization.')}
                                    {activeKPI === 'spend' && (rawRevenue === 0 && rawSpend > 500 ? 'BURN ALERT: Zero revenue. Pause immediately.' : 'Efficiency healthy at current pacing.')}
                                    {activeKPI === 'cpa' && (cpaValue <= 300 ? 'CPA is below target. Campaign acquiring effectively.' : 'CPA is above target. Review landing page messaging.')}
                                    {activeKPI === 'convValue' && (convValue > cpaValue ? 'Profitable conversions - consider scaling.' : 'Conversion value below CPA - review pricing.')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Efficiency Timeline */}
                    <DetailCard title="Efficiency Timeline" icon={Activity}>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs text-gray-500">ROAS vs CPA over last 7 days</p>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span> ROAS</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> CPA</span>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={efficiencyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#6366f1" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}x`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                                    <RechartsTooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                    <Area yAxisId="left" type="monotone" dataKey="roas" stroke="#6366f1" fill="#e0e7ff" fillOpacity={0.4} strokeWidth={2} name="ROAS" />
                                    <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="CPA" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </DetailCard>

                    {/* Row Split: Fatigue & Funnel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DetailCard title="Delivery & Fatigue" icon={Monitor}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1 font-semibold">Frequency</div>
                                    <div className={`text-2xl font-bold ${frequency > 2.5 ? 'text-red-600' : frequency > 1.8 ? 'text-amber-600' : 'text-gray-900'}`}>
                                        {frequency.toFixed(1)}x
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        {frequency > 2.5 ? '⚠️ Fatigue risk' : frequency > 1.8 ? 'Monitor closely' : 'Healthy range'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1 font-semibold">CPM</div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(cpm)}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">Cost per 1,000 views</div>
                                </div>
                            </div>
                        </DetailCard>

                        <DetailCard title="Click-to-Conversion Flow" icon={Target}>
                             <div className="flex items-center justify-between py-2">
                                <div className="text-center flex-1">
                                    <div className="text-xl font-bold text-blue-600">{rawClicks.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 mt-1">Clicks</div>
                                </div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1 rounded">-{clickToLeadDrop}%</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 my-0.5" />
                                </div>
                                <div className="text-center flex-1">
                                    <div className="text-xl font-bold text-purple-600">{estimatedLeads.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 mt-1">Est. Leads</div>
                                </div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1 rounded">-{leadToConvDrop}%</span>
                                    <ArrowRight className="w-4 h-4 text-gray-300 my-0.5" />
                                </div>
                                <div className="text-center flex-1">
                                    <div className="text-xl font-bold text-emerald-600">{rawConversions.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 mt-1">Converts</div>
                                </div>
                            </div>
                        </DetailCard>
                    </div>

                    {/* Section 4: Creative Performance Table */}
                    <DetailCard title="Creative Performance" icon={Eye} className="!p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Creative</th>
                                        <th className="px-6 py-4 text-right">Spend</th>
                                        <th className="px-6 py-4 text-right">CTR</th>
                                        <th className="px-6 py-4 text-right">CVR</th>
                                        <th className="px-6 py-4 text-right">Conv.</th>
                                        <th className="px-6 py-4 text-right">CPA</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {creatives.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(c.spend)}</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{c.ctr}%</td>
                                            <td className={`px-6 py-4 text-right font-bold ${c.tag === 'winner' ? 'text-emerald-600' : c.tag === 'bleeder' ? 'text-red-600' : 'text-gray-600'}`}>{c.cvr}%</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{c.conversions}</td>
                                            <td className={`px-6 py-4 text-right ${c.cpa > 500 ? 'text-red-600' : 'text-gray-600'}`}>{formatCurrency(c.cpa)}</td>
                                            <td className="px-6 py-4 text-center">
                                                {c.tag === 'winner' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">winner</span>}
                                                {c.tag === 'bleeder' && <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">bleeder</span>}
                                                {c.tag === 'neutral' && <span className="text-gray-400 text-lg">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DetailCard>

                </LeftColumn>

                {/* 🟨 RIGHT SECTION (4 Cols) */}
                <RightColumn>
                    
                    {/* 1. Status Card */}
                    <DetailCard title="Campaign Engine" icon={Settings}>
                        <div className="flex flex-col gap-4">
                            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold flex justify-between items-center">
                                <span className="text-gray-500 uppercase text-xs tracking-wider">Engine State</span>
                                <span className={`uppercase font-black flex items-center gap-1.5 ${status === 'active' ? 'text-emerald-600' : 'text-gray-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                    {status}
                                </span>
                            </div>
                        </div>
                    </DetailCard>

                    {/* 2. Platform Status Tracking */}
                    <DetailCard title="Platform Sync" icon={Activity}>
                        <PlatformPublishStatus
                            facebookCampaignId={campaign.facebook_campaign_id}
                            googleCampaignId={campaign.google_campaign_id}
                            lastSyncedAt={campaign.last_synced_at}
                        />
                        {syncError && (
                            <p className="text-xs text-red-600 mt-3 flex items-center gap-1 p-2 bg-red-50 rounded border border-red-100">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> {syncError}
                            </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-3 flex gap-2 w-full justify-center">
                          Platforms running: {platforms?.map(p => <span key={p} className="inline-flex">{getPlatformIcon(p)}</span>)}
                        </p>
                    </DetailCard>

                    {/* 3. Quick Actions (STICKY) */}
                    <div className="sticky top-6">
                        <DetailCard title="Control Panel" icon={Settings} className="border-blue-100 ring-1 ring-blue-50">
                            <div className="flex flex-col gap-3">
                                {isRunning && (
                                    <button 
                                      onClick={() => handleAction('pause')}
                                      className="w-full py-3 px-4 rounded-xl text-sm font-bold transition-all text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Pause className="w-5 h-5" /> Pause Tracking
                                    </button>
                                )}
                                {(isPaused || isDraft) && (
                                    <button 
                                      onClick={() => handleAction(isDraft ? 'launch' : 'resume')}
                                      disabled={!launchCheck.allowed}
                                      className="w-full py-3 px-4 rounded-xl text-sm font-bold transition-all text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Play className="w-5 h-5" /> {isDraft ? 'Launch Campaign' : 'Resume Campaign'}
                                    </button>
                                )}
                                
                                <button 
                                    onClick={handleSyncPerformance}
                                    disabled={isSyncing || (!campaign.facebook_campaign_id && !campaign.google_campaign_id)}
                                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
                                    {isSyncing ? 'Syncing Now...' : 'Force Sync Data'}
                                </button>
                                
                                <div className="w-full h-px bg-gray-100 my-1"></div>
                                
                                <button 
                                    onClick={handleEdit}
                                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> Edit Target Setup
                                </button>
                                
                                {isRunning && (
                                    <button 
                                        onClick={handleGenerateLead}
                                        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2"
                                    >
                                        <Users className="w-4 h-4" /> Simulate Test Lead
                                    </button>
                                )}
                            </div>
                        </DetailCard>
                    </div>

                </RightColumn>
            </DetailGrid>
        </BaseDetailLayout>
    );
}

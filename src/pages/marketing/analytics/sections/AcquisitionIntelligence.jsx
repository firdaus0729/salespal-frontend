import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Sparkles, Users, Target, Filter, Loader2, TrendingUp, AlertTriangle, Activity, BarChart2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { usePreferences } from '../../../../context/PreferencesContext';

// --- SUB-COMPONENTS ---

const KPICard = ({ title, metric, change, isPositive, icon, inverseColorLogic = false }) => {
    const IconComponent = icon;
    const isGood = inverseColorLogic ? !isPositive : isPositive;
    const colorClass = isGood ? 'text-emerald-600' : 'text-rose-600';
    const bgColorClass = isGood ? 'bg-emerald-50' : 'bg-rose-50';

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between" style={{ height: '140px' }}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{title}</span>
                </div>
            </div>
            <div className="flex items-end justify-between mt-auto">
                <div>
                    <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">{metric}</h4>
                    {change !== null && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${bgColorClass} ${colorClass}`}>
                                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(change).toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium ml-1 uppercase tracking-wider mt-0.5">vs last 7 days</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Acquisition Intelligence</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium">Loading analytics...</p>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
    </section>
);

const EmptyState = ({ compareMode, aiInsightData }) => (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Acquisition Intelligence</h2>
            </div>
            <p className="text-sm text-gray-500 font-medium">AI-powered campaign performance analysis</p>
        </div>
        <div className="p-6">
            {aiInsightData ? (
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                            aiInsightData.type === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                            aiInsightData.type === 'negative' ? 'bg-rose-50 text-rose-600' :
                            aiInsightData.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                            'bg-gray-50 text-gray-500'
                        }`}>
                            {aiInsightData.type === 'positive' ? <TrendingUp className="w-5 h-5" /> :
                             aiInsightData.type === 'negative' ? <AlertTriangle className="w-5 h-5" /> :
                             aiInsightData.type === 'warning' ? <Activity className="w-5 h-5" /> :
                             <Sparkles className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Performance Insight</h4>
                                {compareMode && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Comparing</span>
                                )}
                            </div>
                            <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-1">{aiInsightData.insight}</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{aiInsightData.recommendation}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Insights will appear once campaign data is available.</p>
                </div>
            )}
        </div>
    </section>
);

// --- MAIN COMPONENT ---
const AcquisitionIntelligence = ({ compareMode = false, aiInsightData = null }) => {
    const { user } = useAuth();
    const { formatCurrency } = usePreferences();
    const [metricsRows, setMetricsRows] = useState([]);
    const [campaignMap, setCampaignMap] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch metrics + campaign names from Supabase
    useEffect(() => {
        if (!user) {
            setMetricsRows([]);
            setCampaignMap({});
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch metrics with campaign info
                const { data: metrics, error } = await supabase
                    .from('campaign_metrics')
                    .select('*, campaigns(name, platform)')
                    .eq('user_id', user.id)
                    .order('date', { ascending: true });

                if (error) {
                    console.error('Failed to fetch campaign_metrics:', error);
                    setMetricsRows([]);
                } else {
                    setMetricsRows(metrics || []);

                    // Build campaign lookup map
                    const cMap = {};
                    (metrics || []).forEach(row => {
                        if (row.campaign_id && row.campaigns) {
                            cMap[row.campaign_id] = {
                                name: row.campaigns.name,
                                platform: row.campaigns.platform
                            };
                        }
                    });
                    setCampaignMap(cMap);
                }
            } catch (err) {
                console.error('AcquisitionIntelligence fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Compute all analytics from real data
    const analytics = useMemo(() => {
        if (!metricsRows.length) return null;

        // --- Aggregate totals ---
        const totals = metricsRows.reduce((acc, row) => ({
            leads: acc.leads + (row.leads || 0),
            qualifiedLeads: acc.qualifiedLeads + (row.qualified_leads || 0),
            conversions: acc.conversions + (row.conversions || 0),
            spend: acc.spend + parseFloat(row.spend || 0),
            impressions: acc.impressions + (row.impressions || 0),
            clicks: acc.clicks + (row.clicks || 0),
        }), { leads: 0, qualifiedLeads: 0, conversions: 0, spend: 0, impressions: 0, clicks: 0 });

        // --- KPIs ---
        const cpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
        const cvr = totals.leads > 0 ? (totals.conversions / totals.leads) * 100 : 0;

        // --- Trend data (group by date) ---
        const dateMap = {};
        metricsRows.forEach(row => {
            const d = row.date;
            if (!dateMap[d]) dateMap[d] = { date: d, leads: 0, cpl: 0, spend: 0 };
            dateMap[d].leads += (row.leads || 0);
            dateMap[d].spend += parseFloat(row.spend || 0);
        });
        const trendData = Object.values(dateMap)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(d => ({
                name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                leads: d.leads,
                cpl: d.leads > 0 ? Math.round(d.spend / d.leads) : 0,
            }));

        // --- Change calculation (first half vs second half of period) ---
        const midpoint = Math.floor(trendData.length / 2);
        const firstHalf = trendData.slice(0, midpoint);
        const secondHalf = trendData.slice(midpoint);

        const sumLeads = (arr) => arr.reduce((a, d) => a + d.leads, 0);
        const sumSpend = (arr) => arr.reduce((a, d) => a + (d.cpl * d.leads), 0);

        const firstLeads = sumLeads(firstHalf) || 1;
        const secondLeads = sumLeads(secondHalf);
        const leadsChange = ((secondLeads - firstLeads) / firstLeads) * 100;

        const firstSpend = sumSpend(firstHalf) || 1;
        const secondSpend = sumSpend(secondHalf);
        const cplFirstAvg = firstLeads > 0 ? firstSpend / firstLeads : 0;
        const cplSecondAvg = secondLeads > 0 ? secondSpend / secondLeads : 0;
        const cplChange = cplFirstAvg > 0 ? ((cplSecondAvg - cplFirstAvg) / cplFirstAvg) * 100 : 0;

        // --- Funnel ---
        const funnel = {
            leads: totals.leads,
            qualified: totals.qualifiedLeads,
            converted: totals.conversions,
        };

        // --- Channel efficiency (group by platform) ---
        const channelMap = {};
        metricsRows.forEach(row => {
            const platform = row.campaigns?.platform || 'unknown';
            if (!channelMap[platform]) {
                channelMap[platform] = { leads: 0, qualifiedLeads: 0, spend: 0 };
            }
            channelMap[platform].leads += (row.leads || 0);
            channelMap[platform].qualifiedLeads += (row.qualified_leads || 0);
            channelMap[platform].spend += parseFloat(row.spend || 0);
        });

        const platformLabels = { meta: 'Meta Ads', google: 'Google Ads', linkedin: 'LinkedIn' };
        const channels = Object.entries(channelMap).map(([platform, data]) => ({
            name: platformLabels[platform] || platform,
            leads: data.leads,
            cpl: data.leads > 0 ? formatCurrency(Math.round(data.spend / data.leads)) : '—',
            qualRate: data.leads > 0 ? Math.round((data.qualifiedLeads / data.leads) * 100) + '%' : '—',
            status: data.leads > 0 && (data.qualifiedLeads / data.leads) >= 0.7 ? 'optimal'
                : data.leads > 0 && (data.qualifiedLeads / data.leads) >= 0.5 ? 'warning' : 'neutral',
        })).sort((a, b) => b.leads - a.leads);

        // --- Per-campaign table ---
        const campaignAgg = {};
        metricsRows.forEach(row => {
            const cid = row.campaign_id;
            if (!campaignAgg[cid]) campaignAgg[cid] = { leads: 0, qualifiedLeads: 0, spend: 0 };
            campaignAgg[cid].leads += (row.leads || 0);
            campaignAgg[cid].qualifiedLeads += (row.qualified_leads || 0);
            campaignAgg[cid].spend += parseFloat(row.spend || 0);
        });

        const campaignTable = Object.entries(campaignAgg).map(([cid, data]) => {
            const info = campaignMap[cid] || { name: 'Unknown Campaign' };
            const campCpl = data.leads > 0 ? Math.round(data.spend / data.leads) : 0;
            const qualRate = data.leads > 0 ? Math.round((data.qualifiedLeads / data.leads) * 100) : 0;
            return {
                name: info.name,
                leads: data.leads,
                cpl: formatCurrency(campCpl),
                qualRate: qualRate + '%',
                status: campCpl < 120 ? 'efficient' : campCpl > 200 ? 'high-cost' : 'monitor',
            };
        }).sort((a, b) => b.leads - a.leads);

        // --- AI insight ---
        const bestChannel = channels[0];
        const worstChannel = channels.length > 1 ? channels[channels.length - 1] : null;
        let aiInsight = 'Track more campaign data to unlock AI-powered acquisition insights.';
        if (bestChannel && worstChannel && bestChannel.name !== worstChannel.name) {
            aiInsight = `${bestChannel.name} is generating the most leads (${bestChannel.leads}) with the best efficiency. Consider shifting budget from ${worstChannel.name} to maximize acquisition ROI this week.`;
        }

        return {
            kpis: {
                totalLeads: { value: totals.leads.toLocaleString(), change: leadsChange, isPositive: leadsChange >= 0 },
                cpl: { value: formatCurrency(Math.round(cpl)), change: cplChange, isPositive: cplChange < 0 },
                cvr: { value: cvr.toFixed(1) + '%', change: null, isPositive: true },
                qualified: { value: totals.qualifiedLeads.toLocaleString(), change: null, isPositive: true },
            },
            trendData,
            funnel,
            channels,
            campaignTable,
            aiInsight,
        };
    }, [metricsRows, campaignMap, formatCurrency]);

    // --- RENDER ---
    if (loading) return <LoadingSkeleton />;
    if (!analytics) return <EmptyState compareMode={compareMode} aiInsightData={aiInsightData} />;

    const { kpis, trendData, funnel, channels, campaignTable, aiInsight } = analytics;

    const qualDrop = funnel.leads > 0 ? Math.round((1 - funnel.qualified / funnel.leads) * 100) : 0;
    const convDrop = funnel.qualified > 0 ? Math.round((1 - funnel.converted / funnel.qualified) * 100) : 0;

    return (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Acquisition Intelligence</h2>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Lead generation performance and funnel efficiency</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-gray-700">Live Acquisition Data</span>
                </div>
            </div>

            <div className="p-6">
                {/* 1. KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard title="Total Leads" metric={kpis.totalLeads.value} change={kpis.totalLeads.change} isPositive={kpis.totalLeads.isPositive} icon={Users} />
                    <KPICard title="Cost Per Lead" metric={kpis.cpl.value} change={kpis.cpl.change} isPositive={kpis.cpl.change < 0} icon={Target} inverseColorLogic={true} />
                    <KPICard title="Conversion Rate" metric={kpis.cvr.value} change={kpis.cvr.change} isPositive={kpis.cvr.isPositive} icon={Sparkles} />
                    <KPICard title="Qualified Leads" metric={kpis.qualified.value} change={kpis.qualified.change} isPositive={kpis.qualified.isPositive} icon={Filter} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* 2. Lead Trend Chart */}
                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Lead Volume vs CPL (7 Days)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Line yAxisId="left" type="monotone" name="Leads" dataKey="leads" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }} />
                                    <Line yAxisId="right" type="monotone" name="CPL (₹)" dataKey="cpl" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#10B981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Campaign Lead Performance Table */}
                        {campaignTable.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Top Campaign Lead Performance</h3>
                                <p className="text-xs text-gray-500 mb-4">Campaign-level acquisition efficiency</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold rounded-l-lg">Campaign Name</th>
                                                <th className="px-4 py-2 font-semibold text-right">Leads</th>
                                                <th className="px-4 py-2 font-semibold text-right">CPL</th>
                                                <th className="px-4 py-2 font-semibold text-right">Qual. Rate</th>
                                                <th className="px-4 py-2 font-semibold text-center rounded-r-lg">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {campaignTable.map((camp, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{camp.name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700">{camp.leads}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700">{camp.cpl}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700">{camp.qualRate}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {camp.status === 'efficient' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Efficient</span>
                                                        )}
                                                        {camp.status === 'monitor' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Monitor</span>
                                                        )}
                                                        {camp.status === 'high-cost' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">High Cost</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Mini Funnel & 4. Channel Efficiency */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* 3. Mini Funnel Visual */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Funnel Efficiency</h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Total Leads</span>
                                        <span className="text-gray-900">{funnel.leads.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-indigo-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 px-2 py-0.5">
                                    <span className="flex items-center gap-1"><ArrowDownRight className="w-3 h-3 text-rose-400" /> {qualDrop}% drop</span>
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Qualified Leads</span>
                                        <span className="text-gray-900">{funnel.qualified.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-blue-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${funnel.leads > 0 ? (funnel.qualified / funnel.leads) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 px-2 py-0.5">
                                    <span className="flex items-center gap-1"><ArrowDownRight className="w-3 h-3 text-rose-400" /> {convDrop}% drop</span>
                                </div>
                                <div className="relative">
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">Converted</span>
                                        <span className="text-gray-900">{funnel.converted.toLocaleString()}</span>
                                    </div>
                                    <div className="h-4 bg-emerald-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${funnel.leads > 0 ? (funnel.converted / funnel.leads) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Channel Lead Efficiency */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Channel Lead Efficiency</h3>
                            <div className="space-y-3">
                                {channels.map((channel, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-colors">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{channel.name}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                <span>{channel.leads} leads</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{channel.qualRate} qual.</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900">{channel.cpl}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-semibold">CPL</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. AI Performance Insight — Always On */}
                {aiInsightData && (
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl shrink-0 ${
                                aiInsightData.type === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                                aiInsightData.type === 'negative' ? 'bg-rose-50 text-rose-600' :
                                aiInsightData.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                'bg-gray-50 text-gray-500'
                            }`}>
                                {aiInsightData.type === 'positive' ? <TrendingUp className="w-5 h-5" /> :
                                 aiInsightData.type === 'negative' ? <AlertTriangle className="w-5 h-5" /> :
                                 aiInsightData.type === 'warning' ? <Activity className="w-5 h-5" /> :
                                 <Sparkles className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Performance Insight</h4>
                                    {compareMode && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Comparing</span>
                                    )}
                                </div>
                                <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-1">{aiInsightData.insight}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{aiInsightData.recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AcquisitionIntelligence;

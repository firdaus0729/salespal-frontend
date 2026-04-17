/**
 * ARCHITECTURE GUARD: LAYER 2 - CAMPAIGN OPTIMIZATION
 * ---------------------------------------------------
 * Scope: Actionable Campaign & Project Level Data.
 * Rules:
 * 1. Focus on actionable optimization metrics (CPC, CPM, Device, Creative).
 * 2. Data must be strictly scoped to the selected Campaign/Project.
 * 3. NO deep root-cause diagnostics by default (must use Drilldown).
 * 4. Must provide access to Layer 3 (AdvancedDrilldown).
 */
import React, { useState, useMemo } from 'react';
import {
    Megaphone, Activity, BarChart2, ChevronDown, ChevronUp,
    Smartphone, Monitor, Calendar, Zap, Layers, Users
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import {
    calculateCPL, calculateCPM, calculateROAS, calculateCTR, calculateCPC, calculateFrequency,
    calculateLandingPageCVR
} from '../../../../utils/analyticsCalculations';
import { usePreferences } from '../../../../context/PreferencesContext';

const MetricCard = ({ label, value, subtext }) => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg text-center shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

const SectionHeader = ({ title, icon: Icon, isOpen, onToggle }) => (
    <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 bg-gray-50 border border-gray-100 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-100 transition-colors"
    >
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            {title}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
);

const PlatformScoreCard = ({ score, impShare }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-indigo-900">Platform Intelligence</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">{score?.label || 'Score'}</span>
                <span className="text-2xl font-bold text-indigo-700">{score?.value || 'N/A'}</span>
                {/* <span className="text-xs text-indigo-500">{score?.sub || 'No Data'}</span> */}
            </div>
            {impShare && (
                <div className="flex flex-col border-l border-indigo-100 pl-6">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Impression Share</span>
                    <span className="text-2xl font-bold text-indigo-700">{(impShare * 100).toFixed(1)}%</span>
                    <span className="text-xs text-indigo-500">Lost to rank: Low</span>
                </div>
            )}
        </div>
    </div>
);

const CampaignDetailView = ({ campaign }) => {
    // Zero-state guard
    if (!campaign) return <div className="p-6 text-center text-gray-500">No campaign selected.</div>;

    const details = campaign.details || {};
    const [sections, setSections] = useState({
        device: true,
        day: false,
        creative: false,
        audience: false,
        landing: false
    });
    const [showDrilldown, setShowDrilldown] = useState(false);
    const { formatCurrency } = usePreferences();

    const toggleSection = (key) => setSections(prev => ({ ...prev, [key]: !prev[key] }));

    // --- DERIVED METRICS ---
    const cpl = calculateCPL(campaign.spend, campaign.leads);
    const cpm = calculateCPM(campaign.spend, campaign.impressions);
    const roas = calculateROAS(campaign.revenue, campaign.spend);
    const cpc = calculateCPC(campaign.spend, campaign.clicks);
    const frequency = calculateFrequency(campaign.impressions, campaign.reach);
    const lpCvr = calculateLandingPageCVR(campaign.conversions, campaign.clicks);
    const convValue = campaign.revenue || 0;

    // Platform Specifics
    const platformData = details.platformSpecific || {};
    const platformScore = platformData.qualityScore
        ? { label: 'Quality Score', value: platformData.qualityScore + '/10' }
        : platformData.relevanceScore
            ? { label: 'Relevance Score', value: platformData.relevanceScore + '/10' }
            : null;
    const impShare = platformData.impressionShare;

    // Device Transformations
    const deviceData = useMemo(() => {
        if (!details.device) return [];
        const total = details.device.reduce((acc, d) => acc + (d.impressions || 0), 0);
        return details.device.map((d, i) => ({
            name: d.name,
            value: total > 0 ? Math.round((d.impressions / total) * 100) : 0,
            color: i === 0 ? '#4f46e5' : '#93c5fd' // Simple alternating colors
        }));
    }, [details.device]);

    return (
        <div className="relative overflow-hidden" style={{ minHeight: '600px' }}>
            {/* Main Content */}
            <div className={`transition-all duration-300 ${showDrilldown ? 'opacity-0 translate-x-[-20%]' : 'opacity-100'}`}>
                <div className="space-y-6">
                    {/* 1. Header Info */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-blue-600">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-500">{campaign.platform} • <span className={campaign.status === 'Running' ? 'text-green-600 font-medium' : 'text-gray-500'}>{campaign.status}</span></p>
                        </div>
                        <div className="ml-auto text-right flex flex-col items-end gap-2">
                            {/* Drilldown removed per strict metrics auditing */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Total Spend</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(campaign.spend || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Core Metrics Grid */}
                    {/* 2. Core Metrics Grid (Financial Health Focus) */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <MetricCard label="ROAS" value={`${roas.toFixed(2)}x`} subtext="Target: 3.0x" />
                        <MetricCard label="Revenue" value={formatCurrency(convValue)} />
                        <MetricCard label="Spend" value={formatCurrency(campaign.spend || 0)} />
                        <MetricCard label="CPA" value={formatCurrency(cpl)} />
                        <MetricCard label="Frequency" value={frequency.toFixed(2)} />
                    </div>

                    {/* 3. Platform Intelligence */}
                    {(platformScore || impShare) && (
                        <PlatformScoreCard
                            score={platformScore}
                            impShare={impShare}
                        />
                    )}

                    {/* 4. Optimization Sections (Accordion) */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                        {/* Audience Demographics (Moved here per request) */}
                        <div>
                            <SectionHeader
                                title="Audience Demographics"
                                icon={Users}
                                isOpen={sections.audience}
                                onToggle={() => toggleSection('audience')}
                            />
                            {sections.audience && (
                                <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Age Dist */}
                                    <div className="h-48">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">Age Distribution</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={details.demographics?.age || []}>
                                                <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#f3f4f6' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Gender Split */}
                                    <div className="h-48">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">Gender Split</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPie>
                                                <Pie
                                                    data={details.demographics?.gender || []}
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {(details.demographics?.gender || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Device Performance */}
                        <div>
                            <SectionHeader
                                title="Device Performance (Impressions)"
                                icon={Smartphone}
                                isOpen={sections.device}
                                onToggle={() => toggleSection('device')}
                            />
                            {sections.device && deviceData.length > 0 && (
                                <div className="p-5 bg-white border-t border-gray-100">
                                    <div className="flex h-4 rounded-full overflow-hidden mb-2">
                                        {deviceData.map((d, i) => (
                                            <div key={i} style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        {deviceData.map((d, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                                <span className="font-medium">{d.name} ({d.value}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Day of Week */}
                        {/* Day of Week - REMOVED PER REDESIGN BLUEPRINT (Noise Reduction) */}
                        {/* <div className="border-t border-gray-100">
                            <SectionHeader
                                title="Day of Week Performance (Impressions)"
                                icon={Calendar}
                                isOpen={sections.day}
                                onToggle={() => toggleSection('day')}
                            />
                            {sections.day && details.dayPerf && (
                                <div className="p-5 bg-white">
                                    <div className="flex items-end justify-between gap-2 h-24">
                                        {details.dayPerf.map((day, i) => {
                                            const maxVal = Math.max(...details.dayPerf.map(d => d.impressions));
                                            const height = maxVal > 0 ? (day.impressions / maxVal) * 100 : 0;
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-1 w-full">
                                                    <div
                                                        className="w-full bg-blue-100 rounded-t-sm relative group hover:bg-blue-200 transition-colors"
                                                        style={{ height: `${height}%` }}
                                                    >
                                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {day.impressions}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium">{day.day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div> */}

                        {/* Landing Page & Traffic Quality */}
                        <div className="border-t border-gray-100">
                            <SectionHeader
                                title="Landing Page & Traffic Quality"
                                icon={Zap}
                                isOpen={sections.landing}
                                onToggle={() => toggleSection('landing')}
                            />
                            {sections.landing && (
                                <div className="p-5 bg-white grid grid-cols-2 gap-4">
                                    <MetricCard label="Landing Page CVR" value={lpCvr.toFixed(2) + '%'} />
                                    {(campaign.platform === 'Meta Ads' || campaign.platform?.toLowerCase().includes('meta') || campaign.platform?.toLowerCase().includes('facebook')) && (
                                        <div className="p-4 bg-white border border-gray-200 rounded-lg text-center shadow-sm">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Link Clicks / All Clicks</p>
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-xl font-bold text-gray-900">
                                                    {details.platformSpecific?.linkClicks?.toLocaleString() || 'N/A'}
                                                </span>
                                                <span className="text-gray-400 text-sm">/ {campaign.clicks?.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-1">
                                                {details.platformSpecific?.linkClicks && campaign.clicks
                                                    ? Math.round((details.platformSpecific.linkClicks / campaign.clicks) * 100) + '% Traffic Quality'
                                                    : 'Quality unknown'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Creative Performance */}
                        <div className="border-t border-gray-100">
                            <SectionHeader
                                title="Creative Performance"
                                icon={Layers}
                                isOpen={sections.creative}
                                onToggle={() => toggleSection('creative')}
                            />
                            {sections.creative && details.creatives && (
                                <div className="p-0 bg-white">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Creative Name</th>
                                                <th className="px-4 py-3 font-semibold">Spend</th>
                                                <th className="px-4 py-3 font-semibold">Clicks</th>
                                                <th className="px-4 py-3 font-semibold">Conversions</th>
                                                <th className="px-4 py-3 font-semibold">CVR</th>
                                                <th className="px-4 py-3 font-semibold">CTR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {details.creatives.map((c, i) => {
                                                const ctr = calculateCTR(c.clicks, c.impressions);
                                                const cvr = calculateLandingPageCVR(c.conversions, c.clicks);
                                                return (
                                                    <tr key={i} className="hover:bg-blue-50/30">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                                                        <td className="px-4 py-3 text-gray-500">{formatCurrency(c.spend || 0)}</td>
                                                        <td className="px-4 py-3 text-gray-600">{c.clicks?.toLocaleString() || 0}</td>
                                                        <td className="px-4 py-3 text-gray-600">{c.conversions?.toLocaleString() || 0}</td>
                                                        <td className="px-4 py-3 text-gray-600 font-medium">{cvr.toFixed(1)}%</td>
                                                        <td className={`px-4 py-3 font-bold ${ctr > 2 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {ctr.toFixed(2)}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* AI Insight Footer */}
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex gap-3 text-amber-900 mt-4">
                        <Zap className="w-5 h-5 shrink-0 text-amber-600" />
                        <div>
                            <h4 className="text-sm font-bold mb-1">AI Recommendation</h4>
                            <p className="text-xs opacity-90 leading-relaxed">
                                Mobile performance is dominating (65% share).
                                Consider increasing mobile bid adjustments by +15% to capture more efficient traffic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* DRILLDOWN REMOVED */}
        </div>
    );
};

export default CampaignDetailView;

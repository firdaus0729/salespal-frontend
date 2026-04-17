import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMarketing } from '../../../context/MarketingContext';
import { useAnalytics, AnalyticsProvider } from '../../../context/AnalyticsContext';
import { formatROAS } from '../../../utils/formatCurrency';
import { usePreferences } from '../../../context/PreferencesContext';
import { ArrowLeft, TrendingUp, TrendingDown, HelpCircle, Target, MousePointerClick, BarChart3 } from 'lucide-react';
import CurrencyIcon from '../../../components/ui/CurrencyIcon';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// KPI_CONFIG is now built inside DrilldownContent to use context-aware formatCurrency

export default function MarketingKPIDrilldown() {
    return (
        <AnalyticsProvider>
            <DrilldownContent />
        </AnalyticsProvider>
    );
}

function DrilldownContent() {
    const { kpiType } = useParams();
    const navigate = useNavigate();
    const { campaigns } = useMarketing();
    const { selectedProjectId } = useAnalytics();
    const { formatCurrency } = usePreferences();

    const KPI_CONFIG = {
        roas: {
            label: "Return on Ad Spend (ROAS)",
            shortLabel: "ROAS",
            description: "Revenue generated for every unit spent.",
            format: (val) => formatROAS(val),
            icon: TrendingUp,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            stroke: "#6366f1",
            fill: "#e0e7ff"
        },
        cpa: {
            label: "Cost Per Acquisition (CPA)",
            shortLabel: "CPA",
            description: "Average cost to acquire one conversion.",
            format: (val) => formatCurrency(val),
            icon: Target,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            stroke: "#f43f5e",
            fill: "#ffe4e6"
        },
        spend: {
            label: "Total Spend",
            shortLabel: "Spend",
            description: "Total budget utilized across campaigns.",
            format: (val) => formatCurrency(val),
            icon: CurrencyIcon,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            stroke: "#3b82f6",
            fill: "#dbeafe"
        },
        revenue: {
            label: "Total Revenue",
            shortLabel: "Revenue",
            description: "Total revenue generated from campaigns.",
            format: (val) => formatCurrency(val),
            icon: CurrencyIcon,
            color: "text-green-600",
            bgColor: "bg-green-50",
            stroke: "#22c55e",
            fill: "#dcfce7"
        }
    };

    const kpi = kpiType; // Alias for compatibility
    const config = KPI_CONFIG[kpi] || KPI_CONFIG.spend; // Fallback

    // Data Processing
    const analysisData = useMemo(() => {
        // 1. Filter: Active/Running + Project Scope
        const activeCampaigns = campaigns.filter(c => {
            const isProjectMatch = selectedProjectId === 'all' || c.projectId === selectedProjectId;
            const isActive = c.status === 'active';
            return isProjectMatch && isActive;
        });

        // 2. Map & Calculate Metrics
        const mapped = activeCampaigns.map(c => {
            const spend = Number(c.spend) || 0;
            const revenue = Number(c.revenue) || 0;
            const conversions = Number(c.conversions) || 0;

            let kpiValue = 0;
            if (kpi === 'roas') kpiValue = spend > 0 ? revenue / spend : 0;
            if (kpi === 'cpa') kpiValue = conversions > 0 ? spend / conversions : 0;
            if (kpi === 'spend') kpiValue = spend;
            if (kpi === 'revenue') kpiValue = revenue;

            return {
                ...c,
                spend,
                revenue,
                conversions,
                kpiValue,
                ctr: c.metrics?.ctr || 0
            };
        });

        // 3. Sort by KPI (Desc for most, Asc for CPA if we wanted efficiency, but request says "Sort by selected KPI (desc)")
        // Typically detailed analysis might want worst CPA first, but "contribution" usually implies magnitude.
        // For ROAS/Revenue/Spend, Desc is best. For CPA, Desc means "Highest Cost" (Inefficient).
        // Let's stick to Desc as requested to show "Top Contributors" or "Highest Impact".
        const sorted = [...mapped].sort((a, b) => b.kpiValue - a.kpiValue);

        // 4. Calculate Totals for Context Strip
        const totalKPI = sorted.reduce((acc, curr) => acc + curr.kpiValue, 0);
        // Note: Summing ROAS/CPA doesn't make sense, need weighted avg for those.

        let aggregateValue = 0;
        const totalSpend = sorted.reduce((a, c) => a + c.spend, 0);
        const totalRev = sorted.reduce((a, c) => a + c.revenue, 0);
        const totalConv = sorted.reduce((a, c) => a + c.conversions, 0);

        if (kpi === 'roas') aggregateValue = totalSpend > 0 ? totalRev / totalSpend : 0;
        else if (kpi === 'cpa') aggregateValue = totalConv > 0 ? totalSpend / totalConv : 0;
        else if (kpi === 'spend') aggregateValue = totalSpend;
        else if (kpi === 'revenue') aggregateValue = totalRev;

        // 5. Calculate Contribution % (where applicable - makes sense for Spend/Rev/Conv, not ROAS/CPA)
        const withContribution = sorted.map(c => ({
            ...c,
            contribution: (kpi === 'spend' || kpi === 'revenue') && aggregateValue > 0
                ? (c.kpiValue / aggregateValue) * 100
                : 0
        }));

        return {
            campaigns: withContribution,
            aggregateValue,
            totalSpend,
            totalRev,
            totalConv
        };
    }, [campaigns, kpi, selectedProjectId]);

    const handleRowClick = (campaignId) => {
        navigate(`/marketing/campaigns/${campaignId}`);
    };

    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            {/* 1. Header */}
            <div>
                <button
                    onClick={() => navigate('/marketing')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Icon className={`w-8 h-8 ${config.color}`} />
                    {config.label}
                </h1>
                <p className="text-gray-500 mt-1">Analyzing active campaigns contributing to overall {config.shortLabel}.</p>
            </div>

            {/* 2. KPI Context Strip with Plain-English Explanation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${config.bgColor}`}>
                            <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Current {config.shortLabel}</div>
                            <div className="text-3xl font-bold text-gray-900">{config.format(analysisData.aggregateValue)}</div>
                        </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="h-16 w-32 md:w-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { v: analysisData.aggregateValue * 0.9 },
                                { v: analysisData.aggregateValue * 0.95 },
                                { v: analysisData.aggregateValue * 1.1 },
                                { v: analysisData.aggregateValue * 1.05 },
                                { v: analysisData.aggregateValue * 1.0 },
                                { v: analysisData.aggregateValue * 1.15 },
                                { v: analysisData.aggregateValue }
                            ]}>
                                <Area type="monotone" dataKey="v" stroke={config.stroke} fill={config.fill} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plain-English Explanation */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {kpi === 'roas' && (
                            <>Your campaigns are generating <strong>{config.format(analysisData.aggregateValue)}</strong> for every {formatCurrency(1)} spent.
                                {analysisData.aggregateValue >= 3 ? ' This is excellent performance.' : analysisData.aggregateValue >= 2 ? ' This is good but has room for improvement.' : ' Consider optimizing underperforming campaigns.'}</>
                        )}
                        {kpi === 'cpa' && (
                            <>You're paying <strong>{config.format(analysisData.aggregateValue)}</strong> on average to acquire each conversion.
                                {analysisData.aggregateValue <= 50 ? ' This is within healthy range.' : ' This is higher than typical targets. Review campaigns with high CPA.'}</>
                        )}
                        {kpi === 'spend' && (
                            <>Your total ad spend across {analysisData.campaigns.length} active campaigns is <strong>{config.format(analysisData.aggregateValue)}</strong>.
                                The top {Math.min(3, analysisData.campaigns.length)} campaigns account for most of your budget.</>
                        )}
                        {kpi === 'revenue' && (
                            <>Your campaigns have generated <strong>{config.format(analysisData.aggregateValue)}</strong> in total revenue.
                                {analysisData.campaigns.length > 0 ? ` Your top performer is "${analysisData.campaigns[0]?.name || 'Unknown'}".` : ''}</>
                        )}
                    </p>
                </div>
            </div>

            {/* 3. Inline Risks & Opportunities */}
            {analysisData.campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Risk: Worst performer */}
                    {(() => {
                        const worstCampaign = kpi === 'roas' || kpi === 'revenue'
                            ? [...analysisData.campaigns].sort((a, b) => a.kpiValue - b.kpiValue)[0]
                            : kpi === 'cpa'
                                ? [...analysisData.campaigns].sort((a, b) => b.kpiValue - a.kpiValue)[0]
                                : null;
                        if (!worstCampaign) return null;
                        return (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold text-red-700 uppercase">Risk</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{worstCampaign.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">
                                    {kpi === 'roas' && `ROAS of ${config.format(worstCampaign.kpiValue)} is dragging down your average.`}
                                    {kpi === 'cpa' && `CPA of ${config.format(worstCampaign.kpiValue)} is inefficient. Consider pausing.`}
                                    {kpi === 'revenue' && `Low revenue contribution. Review targeting or creatives.`}
                                    {kpi === 'spend' && `High spend with unclear returns. Review performance.`}
                                </p>
                                <button
                                    onClick={() => navigate(`/marketing/campaigns/${worstCampaign.id}`)}
                                    className="mt-3 text-xs font-bold text-red-700 hover:text-red-800"
                                >
                                    View Campaign →
                                </button>
                            </div>
                        );
                    })()}

                    {/* Opportunity: Best performer */}
                    {(() => {
                        const bestCampaign = kpi === 'roas' || kpi === 'revenue'
                            ? analysisData.campaigns[0]
                            : kpi === 'cpa'
                                ? [...analysisData.campaigns].sort((a, b) => a.kpiValue - b.kpiValue)[0]
                                : analysisData.campaigns[0];
                        if (!bestCampaign) return null;
                        return (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700 uppercase">Opportunity</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{bestCampaign.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">
                                    {kpi === 'roas' && `Top ROAS of ${config.format(bestCampaign.kpiValue)}. Consider increasing budget.`}
                                    {kpi === 'cpa' && `Lowest CPA at ${config.format(bestCampaign.kpiValue)}. Scale this campaign.`}
                                    {kpi === 'revenue' && `Highest revenue contributor. Maximize its potential.`}
                                    {kpi === 'spend' && `Review if this spend is generating proportional returns.`}
                                </p>
                                <button
                                    onClick={() => navigate(`/marketing/campaigns/${bestCampaign.id}`)}
                                    className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                                >
                                    View Campaign →
                                </button>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* 3. Campaign Contribution Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Campaign Breakdown</h3>
                    <Badge>Active Campaigns Only</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Campaign Name</th>
                                <th className="px-6 py-3 text-right">Spend</th>
                                <th className="px-6 py-3 text-right">Conversions</th>
                                <th className={`px-6 py-3 text-right font-bold ${config.color}`}>{config.shortLabel}</th>
                                {(kpi === 'spend' || kpi === 'revenue') && (
                                    <th className="px-6 py-3 text-right">Contribution</th>
                                )}
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {analysisData.campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                        No active campaigns found matching this KPI.
                                    </td>
                                </tr>
                            ) : (
                                analysisData.campaigns.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => handleRowClick(c.id)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                {c.platform === 'google' ? (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                )}
                                                {c.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(c.spend)}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{c.conversions}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${config.color}`}>
                                            {config.format(c.kpiValue)}
                                        </td>
                                        {(kpi === 'spend' || kpi === 'revenue') && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs text-gray-500">{c.contribution.toFixed(1)}%</span>
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${kpi === 'revenue' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${c.contribution}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right text-gray-400 group-hover:text-blue-600">
                                            View Details →
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

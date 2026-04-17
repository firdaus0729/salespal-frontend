import React, { useState } from 'react';
import { Layers, TrendingUp, AlertTriangle, CheckCircle, Smartphone, ArrowRight, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const ChannelPerformanceMix = ({ data }) => {
    // Data expected format: [{ platform: 'Meta', spend: 1200, revenue: 3600, conversions: 45, roas: 3.0 }]
    const [metric, setMetric] = useState('spend'); // spend, revenue, conversions

    const metricsResult = {
        spend: { label: 'Spend Share', color: '#8884d8' },
        revenue: { label: 'Revenue Share', color: '#82ca9d' },
        conversions: { label: 'Conversion Share', color: '#ffc658' },
    };

    // Calculate totals
    const totalSpend = data.reduce((acc, d) => acc + (Number(d.spend) || 0), 0);
    const totalRevenue = data.reduce((acc, d) => acc + (Number(d.revenue) || 0), 0);

    // Filter and Process Data
    // We want to show all valid channels.
    const processedData = data.filter(d => (Number(d.spend) || 0) > 0).map(d => {
        const spend = Number(d.spend) || 0;
        const revenue = Number(d.revenue) || 0;

        const spendShare = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
        const revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

        const delta = revenueShare - spendShare; // Positive means Under-allocated (Good ROAS), Negative means Over-allocated (Bad ROAS)

        // AI Insight Logic & Badge Logic
        let insight = "";
        let insightType = 'neutral'; // positive, warning, neutral
        let badgeText = "Balanced";
        let badgeColor = "bg-gray-100 text-gray-600";

        if (delta > 5) {
            insight = "Revenue contribution significantly exceeds budget allocation. Consider increasing spend gradually.";
            insightType = 'positive';
            badgeText = `▲ +${delta.toFixed(1)}% Under-allocated`;
            badgeColor = "bg-emerald-100 text-emerald-700";
        } else if (delta >= 2) {
            insight = "Revenue slightly exceeds spend share. Opportunity for cautious scaling.";
            insightType = 'positive';
            badgeText = `▲ +${delta.toFixed(1)}% Under-allocated`;
            badgeColor = "bg-emerald-50 text-emerald-600";
        } else if (delta > -2 && delta < 2) {
            insight = "Budget allocation is closely aligned with revenue contribution.";
            insightType = 'neutral';
            badgeText = "Balanced Allocation";
            badgeColor = "bg-gray-100 text-gray-600";
        } else if (delta <= -2 && delta > -5) {
            insight = "Spend is slightly higher relative to revenue contribution. Monitor performance.";
            insightType = 'warning';
            badgeText = `▼ ${delta.toFixed(1)}% Over-allocated`;
            badgeColor = "bg-amber-50 text-amber-600";
        } else { // < -5
            insight = "Budget allocation exceeds revenue share. Reallocation may improve efficiency.";
            insightType = 'warning';
            badgeText = `▼ ${delta.toFixed(1)}% Over-allocated`;
            badgeColor = "bg-rose-50 text-rose-700";
        }

        return {
            ...d,
            spendShare,
            revenueShare,
            delta,
            insight,
            insightType,
            badgeText,
            badgeColor
        };
    });

    // Icons mapping
    const getPlatformIcon = (platform) => {
        // Simple mapping based on name
        // In a real app, import specific logos
        return <Activity className="w-5 h-5 text-gray-500" />;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Allocation Intelligence</h3>
                </div>
                <p className="text-xs text-gray-500 ml-12">How budget allocation compares to revenue contribution</p>

                {/* Filters (Kept but currently influencing sort or future tabs) */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start mt-4 ml-12">
                    {Object.keys(metricsResult).map((key) => (
                        <button
                            key={key}
                            onClick={() => setMetric(key)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize whitespace-nowrap ${metric === key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-8 overflow-y-auto pr-2">
                {processedData.map((channel, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                        {/* 1. Header Row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    {getPlatformIcon(channel.platform)}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-900 block">{channel.platform}</span>
                                    <span className="text-xs text-gray-500 font-medium">{channel.roas}x ROAS</span>
                                </div>
                            </div>

                            {/* Delta Badge */}
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${channel.badgeColor}`}>
                                {channel.badgeText}
                            </div>
                        </div>

                        {/* 2. Dual Bar Comparison */}
                        <div className="flex flex-col gap-3 w-full pl-12 pr-2">
                            {/* Spend Bar */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                                    <span>Spend Share</span>
                                    <span>{channel.spendShare.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-purple-200 rounded-full"
                                        style={{ width: `${Math.min(channel.spendShare, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Revenue Bar */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                    <span className="text-indigo-600">Revenue Share</span>
                                    <span className="text-indigo-700">{channel.revenueShare.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full"
                                        style={{ width: `${Math.min(channel.revenueShare, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. AI Insight */}
                        <div className={`ml-12 text-xs flex items-start gap-1.5 p-3 rounded-lg border ${channel.insightType === 'positive' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                                channel.insightType === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-800' : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}>
                            {channel.insightType === 'positive' && <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                            {channel.insightType === 'warning' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                            {channel.insightType === 'neutral' && <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                            <span className="leading-snug">{channel.insight}</span>
                        </div>

                        {/* Divider */}
                        {idx < processedData.length - 1 && <div className="border-b border-gray-100 mt-2" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChannelPerformanceMix;

import React, { useMemo } from 'react';
import AnalyticsSection from '../AnalyticsSection';
import Badge from '../../../../components/ui/Badge';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Minus, ChevronRight } from 'lucide-react';

// Mini Sparkline Component - DETERMINISTIC based on trend
const Sparkline = ({ trend }) => {
    // Generate 7 days of deterministic data based on trend
    const data = useMemo(() => {
        const isUp = trend === 'up';
        const isDown = trend === 'down';
        // Deterministic pattern: base progression with fixed variation per day
        const patterns = [0, 5, -2, 8, 3, 10, 12]; // Fixed daily variations

        return patterns.map((variation, i) => {
            const base = 50;
            const trendFactor = isUp ? i * 5 : isDown ? -i * 5 : 0;
            return { value: base + trendFactor + (isUp ? variation : isDown ? -variation : 0) };
        });
    }, [trend]);

    const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#9ca3af';

    return (
        <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Trend Indicator
const TrendIndicator = ({ trend }) => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
};

const CampaignPerformance = ({ campaigns, onCampaignClick, showProject = false }) => {
    // Derive trend from campaign ROAS performance - DETERMINISTIC
    const campaignsWithTrend = useMemo(() => {
        return campaigns?.map(c => {
            const spend = Number(c.spend) || 0;
            const revenue = Number(c.revenue) || 0;
            const roas = spend > 0 ? revenue / spend : 0;
            // Trend based on ROAS: >3.5 = up, <2 = down, else flat
            const trend = roas >= 3.5 ? 'up' : roas < 2 ? 'down' : 'flat';
            return { ...c, trend };
        }) || [];
    }, [campaigns]);

    const isEmpty = !campaignsWithTrend?.length;

    return (
        <AnalyticsSection
            title="Campaign Performance"
            subtitle="Granular breakdown by campaign"
        >
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                            <th className="pb-3 pl-2">Campaign Name</th>
                            {showProject && <th className="pb-3">Project</th>}
                            <th className="pb-3">Platform</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Spend</th>
                            <th className="pb-3 text-right">Leads</th>
                            <th className="pb-3 text-right">CPL</th>
                            <th className="pb-3 text-right">CTR</th>
                            <th className="pb-3 text-center">7D Trend</th>
                            <th className="pb-3 pr-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {!isEmpty ? (
                            campaignsWithTrend.map((campaign) => (
                                <tr
                                    key={campaign.id}
                                    onClick={() => onCampaignClick?.(campaign)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-2">
                                            <TrendIndicator trend={campaign.trend} />
                                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {campaign.name}
                                            </span>
                                        </div>
                                    </td>
                                    {showProject && (
                                        <td className="py-3 text-gray-500 text-xs">{campaign.projectName}</td>
                                    )}
                                    <td className="py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${campaign.platform === 'Meta' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            campaign.platform === 'Google' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-sky-50 text-sky-700 border-sky-100'
                                            }`}>
                                            {campaign.platform}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <Badge variant={campaign.status === 'Running' ? 'success' : 'neutral'} size="sm">
                                            {campaign.status}
                                        </Badge>
                                    </td>
                                    <td className="py-3 text-right font-medium text-gray-600">{campaign.spend}</td>
                                    <td className="py-3 text-right font-medium text-gray-600">{campaign.leads}</td>
                                    <td className="py-3 text-right font-medium text-gray-600">{campaign.cpl}</td>
                                    <td className="py-3 text-right font-medium text-gray-600">{campaign.ctr}</td>
                                    <td className="py-3 px-2">
                                        <div className="flex justify-center">
                                            <Sparkline trend={campaign.trend} />
                                        </div>
                                    </td>
                                    <td className="py-3 pr-2">
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={showProject ? "10" : "9"} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 font-medium">No campaigns found</p>
                                        <p className="text-gray-400 text-xs">Create your first campaign to see data here</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isEmpty && (
                <div className="mt-4 text-center">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        View All Campaigns
                    </button>
                </div>
            )}
        </AnalyticsSection>
    );
};

export default CampaignPerformance;

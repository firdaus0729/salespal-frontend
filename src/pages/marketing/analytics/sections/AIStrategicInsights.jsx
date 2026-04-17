import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { usePreferences } from '../../../../context/PreferencesContext';

const InsightCard = ({ type, title, description, badgeStart, badgeColor, icon: Icon, buttonText, onClick }) => {

    // Theme configuration based on type
    const themes = {
        growth: {
            bg: 'bg-white',
            border: 'border-emerald-100',
            badgeBg: 'bg-emerald-50',
            badgeText: 'text-emerald-700',
            iconColor: 'text-emerald-600',
            buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
            shadow: 'shadow-sm hover:shadow-md hover:border-emerald-200'
        },
        efficiency: {
            bg: 'bg-white',
            border: 'border-blue-100',
            badgeBg: 'bg-blue-50',
            badgeText: 'text-blue-700',
            iconColor: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            shadow: 'shadow-sm hover:shadow-md hover:border-blue-200'
        },
        risk: {
            bg: 'bg-white',
            border: 'border-rose-100',
            badgeBg: 'bg-rose-50',
            badgeText: 'text-rose-700',
            iconColor: 'text-rose-600',
            buttonBg: 'bg-rose-600 hover:bg-rose-700',
            shadow: 'shadow-sm hover:shadow-md hover:border-rose-200'
        }
    };

    const theme = themes[type] || themes.growth;

    return (
        <div className={`
            flex flex-col p-5 rounded-xl border transition-all duration-300
            ${theme.bg} ${theme.border} ${theme.shadow}
        `}>
            {/* Header: Badge & Icon */}
            <div className="flex items-start justify-between mb-3">
                <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${theme.badgeBg} ${theme.badgeText}
                `}>
                    <Icon className="w-3.5 h-3.5" />
                    {badgeStart}
                </span>
            </div>

            {/* Content */}
            <div className="mb-6 grow">
                <h4 className="text-base font-bold text-gray-900 mb-2 leading-tight">
                    {title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Footer: CTA */}
            <button
                onClick={onClick}
                className={`
                    w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white 
                    flex items-center justify-center gap-2 transition-colors
                    ${theme.buttonBg}
                `}
            >
                {buttonText}
                <ArrowRight className="w-4 h-4 opacity-80" />
            </button>
        </div>
    );
};

const AIStrategicInsights = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatCurrency } = usePreferences();
    const [metricsRows, setMetricsRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real metrics from Supabase
    useEffect(() => {
        if (!user) {
            setMetricsRows([]);
            setLoading(false);
            return;
        }

        const fetchMetrics = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('campaign_metrics')
                    .select('*, campaigns(name, platform)')
                    .eq('user_id', user.id)
                    .order('date', { ascending: true });

                if (error) {
                    console.error('AIStrategicInsights fetch error:', error);
                    setMetricsRows([]);
                } else {
                    setMetricsRows(data || []);
                }
            } catch (err) {
                console.error('AIStrategicInsights error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [user]);

    // Generate insights from REAL data only
    const insights = useMemo(() => {
        if (!metricsRows.length) return [];

        const result = [];

        // Aggregate per-campaign
        const campaignAgg = {};
        metricsRows.forEach(row => {
            const cid = row.campaign_id;
            if (!campaignAgg[cid]) {
                campaignAgg[cid] = {
                    name: row.campaigns?.name || 'Unknown',
                    platform: row.campaigns?.platform || 'unknown',
                    spend: 0, revenue: 0, conversions: 0, days: 0
                };
            }
            campaignAgg[cid].spend += parseFloat(row.spend || 0);
            campaignAgg[cid].revenue += parseFloat(row.revenue || 0);
            campaignAgg[cid].conversions += (row.conversions || 0);
            campaignAgg[cid].days += 1;
        });

        const campaigns = Object.values(campaignAgg);
        const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
        const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
        const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

        // Insight 1: Growth Opportunity — find the highest-ROAS campaign
        const withROAS = campaigns
            .map(c => ({ ...c, roas: c.spend > 0 ? c.revenue / c.spend : 0 }))
            .filter(c => c.roas > 0)
            .sort((a, b) => b.roas - a.roas);

        if (withROAS.length > 0) {
            const best = withROAS[0];
            if (best.roas > overallROAS * 1.2) {
                result.push({
                    id: 1,
                    type: 'growth',
                    badgeStart: 'Growth Opportunity',
                    icon: TrendingUp,
                    title: `Scale ${best.name}`,
                    description: `${best.name} is showing ${best.roas.toFixed(1)}x ROAS with ${formatCurrency(Math.round(best.spend))} spend. Increasing budget may boost revenue while maintaining efficiency.`,
                    buttonText: 'View Campaign',
                    route: '/marketing/campaigns'
                });
            }
        }

        // Insight 2: Efficiency — overall ROAS vs spend trend
        if (overallROAS > 2) {
            result.push({
                id: 2,
                type: 'efficiency',
                badgeStart: 'Efficiency Insight',
                icon: Zap,
                title: 'Strong Overall Efficiency',
                description: `Overall ROAS is ${overallROAS.toFixed(1)}x across ${formatCurrency(Math.round(totalSpend))} total spend. Revenue of ${formatCurrency(Math.round(totalRevenue))} indicates healthy ad performance.`,
                buttonText: 'View Campaigns',
                route: '/marketing/campaigns'
            });
        }

        // Insight 3: Risk — find campaigns with high spend but low/no conversions
        const riskCampaigns = campaigns.filter(c => c.spend > 0 && c.conversions > 0);
        if (riskCampaigns.length > 0) {
            const worstCPA = riskCampaigns
                .map(c => ({ ...c, cpa: c.conversions > 0 ? c.spend / c.conversions : Infinity }))
                .sort((a, b) => b.cpa - a.cpa);

            const worst = worstCPA[0];
            const avgCPA = totalSpend / riskCampaigns.reduce((a, c) => a + c.conversions, 0);

            if (worst.cpa > avgCPA * 1.5) {
                result.push({
                    id: 3,
                    type: 'risk',
                    badgeStart: 'Risk Warning',
                    icon: AlertTriangle,
                    title: `High CPA on ${worst.name}`,
                    description: `${worst.name} CPA is ${formatCurrency(Math.round(worst.cpa))}, which is ${Math.round((worst.cpa / avgCPA - 1) * 100)}% above average. Consider revising targeting or creative.`,
                    buttonText: 'Review Campaign',
                    route: '/marketing/campaigns'
                });
            }
        }

        return result;
    }, [metricsRows, formatCurrency]);

    const handleNavigate = (route) => {
        navigate(route);
    };

    // Don't render if loading or no insights to show
    if (loading) return null;
    if (insights.length === 0) return null;

    return (
        <section className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Your AI Strategic Insights</h2>
                    <p className="text-xs text-gray-500 font-medium">Data-driven growth opportunities & risk detection</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {insights.map(insight => (
                    <InsightCard
                        key={insight.id}
                        {...insight}
                        onClick={() => handleNavigate(insight.route)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AIStrategicInsights;

import React, { useMemo, useState } from 'react';
import { Calendar, Filter, TrendingUp, CreditCard, PieChart, Sparkles } from 'lucide-react';
import CurrencyIcon from '../../../components/ui/CurrencyIcon';
import RevenueImpact from './sections/RevenueImpact';
import CreditTrends from './sections/CreditTrends';
import FinancialKPIs from './sections/FinancialKPIs';
import PlatformROI from './sections/PlatformROI';
import AIFinancialInsights from './sections/AIFinancialInsights';
import { usePreferences } from '../../../context/PreferencesContext';

const RevenueAnalytics = () => {
    const [timeRange, setTimeRange] = useState('30d');
    const { formatCurrency } = usePreferences();

    // Mock general financial data
    const financialData = useMemo(() => {
        return {
            kpis: {
                totalRevenue: { value: formatCurrency(1450000), trend: '+12.5%', icon: CurrencyIcon, color: 'bg-green-100 text-green-700' },
                avgROI: { value: '4.8x', trend: '+0.4x', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
                creditEfficiency: { value: '92%', trend: '+5%', icon: CreditCard, color: 'bg-purple-100 text-purple-700' },
                customerAcqCost: { value: formatCurrency(420), trend: `-${formatCurrency(35)}`, icon: PieChart, color: 'bg-amber-100 text-amber-700' }
            },
            monthlyRevenue: [
                { month: 'Jan', revenue: 850000, cost: 210000 },
                { month: 'Feb', revenue: 920000, cost: 230000 },
                { month: 'Mar', revenue: 1100000, cost: 250000 },
                { month: 'Apr', revenue: 1050000, cost: 240000 },
                { month: 'May', revenue: 1350000, cost: 280000 },
                { month: 'Jun', revenue: 1450000, cost: 300000 }
            ],
            creditUsage: [
                { date: '01/06', calls: 45, whatsapp: 120, images: 12 },
                { date: '08/06', calls: 52, whatsapp: 145, images: 15 },
                { date: '15/06', calls: 48, whatsapp: 160, images: 10 },
                { date: '22/06', calls: 65, whatsapp: 180, images: 22 },
                { date: '29/06', calls: 70, whatsapp: 210, images: 25 }
            ],
            platformROI: [
                { platform: 'Meta', roi: 5.2, revenue: 650000, cost: 125000 },
                { platform: 'Google', roi: 4.5, revenue: 520000, cost: 115000 },
                { platform: 'LinkedIn', roi: 3.8, revenue: 280000, cost: 74000 }
            ],
            aiInsights: [
                {
                    type: 'opportunity',
                    title: 'Revenue Opportunity',
                    description: `Increasing Meta ad spend by 15% on high-performing carousels could boost revenue by ${formatCurrency(120000)} next month.`,
                    impact: 'High'
                },
                {
                    type: 'efficiency',
                    title: 'Credit Optimization',
                    description: 'WhatsApp recovery campaigns have 3x higher ROI than SMS. Redirecting credits here is recommended.',
                    impact: 'Medium'
                },
                {
                    type: 'warning',
                    title: 'CAC Warning',
                    description: 'Customer Acquisition Cost on Google Ads has risen by 12% in the last week. Reviewing keywords is advised.',
                    impact: 'Urgent'
                }
            ]
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header - Scrolls naturally (PART 1 FIX) */}
            <div className="bg-white border-b border-gray-200 relative">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Revenue & Financial Analytics
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Business Owner</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Track financial impact, ROI, and resource efficiency across all campaigns.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['7d', '30d', '90d', 'ytd'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === range
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                {/* 1. Metric Overviews */}
                <FinancialKPIs data={financialData.kpis} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Monthly Revenue Chart (Main) */}
                    <div className="lg:col-span-2">
                        <RevenueImpact data={financialData.monthlyRevenue} />
                    </div>

                    {/* 3. AI Financial Insights (Sidebar) */}
                    <div>
                        <AIFinancialInsights insights={financialData.aiInsights} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 4. Credit Usage Trends */}
                    <CreditTrends data={financialData.creditUsage} />

                    {/* 5. Platform ROI Comparison */}
                    <PlatformROI data={financialData.platformROI} />
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;

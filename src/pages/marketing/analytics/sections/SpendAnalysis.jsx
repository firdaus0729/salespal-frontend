import React, { useMemo } from 'react';
import { usePreferences } from '../../../../context/PreferencesContext';
import AnalyticsSection from '../AnalyticsSection';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-lg font-bold text-rose-600">
                {formatCurrency(payload[0].value)}
            </p>
            <p className="text-xs text-gray-400">Daily Spend</p>
        </div>
    );
};

const SpendAnalysis = ({ data }) => {
    const { formatCurrency } = usePreferences();
    // Generate daily spend data for chart - DETERMINISTIC based on dailyAvg
    const chartData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const baseDaily = data?.dailyAvg || 1000;
        // Deterministic distribution pattern (Mon-Sun weights)
        const weights = [0.9, 1.0, 1.1, 1.05, 1.15, 0.85, 0.75];

        return days.map((day, i) => ({
            day,
            spend: Math.floor(baseDaily * weights[i]),
        }));
    }, [data?.dailyAvg]);

    const avgSpend = data?.dailyAvg || 0;
    const isEmpty = !data?.total;

    return (
        <AnalyticsSection
            title="Spend Analysis"
            subtitle="Budget utilization & burn rate"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wide">Total Spend</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(data?.total) || '—'}
                    </p>
                    {data?.trend && (
                        <p className={`text-xs mt-1 font-medium ${data.trend.startsWith('+') ? 'text-rose-500' : 'text-green-500'}`}>
                            {data.trend} vs prev
                        </p>
                    )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Daily Avg</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(data?.dailyAvg) || '—'}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">Reference line</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-48 w-full">
                {isEmpty ? (
                    <div className="h-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <p className="text-gray-400 text-sm">No spend data</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f3f4f6"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickFormatter={(v) => formatCurrency(v, { compact: true })}
                            />
                            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                            <ReferenceLine
                                y={avgSpend}
                                stroke="#f43f5e"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                            />
                            <Bar
                                dataKey="spend"
                                fill="#fecdd3"
                                radius={[4, 4, 0, 0]}
                                animationDuration={500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-200" /> Daily Spend
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-rose-500" style={{ borderTop: '2px dashed #f43f5e' }} /> Avg Reference
                </span>
            </div>
        </AnalyticsSection>
    );
};

export default SpendAnalysis;

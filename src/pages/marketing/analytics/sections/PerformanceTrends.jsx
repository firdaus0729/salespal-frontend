import React, { useMemo } from 'react';
import AnalyticsSection from '../AnalyticsSection';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { usePreferences } from '../../../../context/PreferencesContext';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-semibold text-gray-700 capitalize w-16">{entry.name}:</span>
                    <span className="text-sm font-bold text-gray-900">
                        {entry.name === 'ROAS' ? `${entry.value}x` : formatCurrency(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

const PerformanceTrends = ({ data, timeRange }) => {
    const { formatCurrency } = usePreferences();
    // Transform data for Recharts
    const chartData = useMemo(() => {
        if (!data?.dates || !data?.roas || !data?.cpa) return [];

        return data.dates.map((date, i) => ({
            date,
            roas: Number(data.roas[i]) || 0,
            cpa: Number(data.cpa[i]) || 0
        }));
    }, [data]);

    const isEmpty = !chartData.length || chartData.every(d => d.roas === 0 && d.cpa === 0);

    return (
        <div className="h-72 w-full mt-4" style={{ minWidth: '100px', minHeight: '100px' }}>
            {isEmpty ? (
                <div className="h-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <p className="text-gray-500 font-medium text-sm">No data available</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            tickFormatter={(v) => `${v}x`}
                            dx={-10}
                            label={{ value: 'ROAS', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6366f1', fontSize: 11 } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            tickFormatter={(v) => formatCurrency(v, { compact: true })}
                            dx={10}
                            label={{ value: 'CPA', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#3b82f6', fontSize: 11 } }}
                        />
                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                        <Legend iconType="circle" />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="roas"
                            name="ROAS"
                            stroke="#6366f1" // Indigo
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="cpa"
                            name="CPA"
                            stroke="#3b82f6" // Blue
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6 }}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PerformanceTrends;

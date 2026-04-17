import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart } from 'recharts';
import AnalyticsSection from '../AnalyticsSection';
import { usePreferences } from '../../../../context/PreferencesContext';

const RevenueImpact = ({ data }) => {
    const { formatCurrency } = usePreferences();
    return (
        <AnalyticsSection
            title="Revenue vs Marketing Cost"
            subtitle="Monthly financial impact of platform activities"
        >
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(value, { compact: true })}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar
                            name="Revenue Generated"
                            dataKey="revenue"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                        />
                        <Line
                            name="Credit & Ad Cost"
                            type="monotone"
                            dataKey="cost"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ fill: '#f43f5e', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Net Profit Impact</p>
                    <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(845000)} <span className="text-sm font-normal text-blue-600">this month</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium text-blue-600">ROI Efficiency</p>
                    <p className="text-sm font-bold text-blue-800">82.4%</p>
                </div>
            </div>
        </AnalyticsSection>
    );
};

export default RevenueImpact;

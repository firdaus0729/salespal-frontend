import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import AnalyticsSection from '../AnalyticsSection';
import { usePreferences } from '../../../../context/PreferencesContext';

const PlatformROI = ({ data }) => {
    const { formatCurrency } = usePreferences();
    return (
        <AnalyticsSection
            title="Platform ROI Comparison"
            subtitle="Revenue vs Spend across marketing channels"
        >
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="platform"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontWeight: 600, fontSize: 13 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', shadow: 'lg' }}
                        />
                        <Legend />
                        <Bar
                            name="ROI Multiplier"
                            dataKey="roi"
                            fill="#818cf8"
                            radius={[0, 4, 4, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="space-y-3">
                    {data.map(item => (
                        <div key={item.platform} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">{item.platform}</span>
                            <div className="flex gap-4">
                                <span className="text-gray-400">Rev: {formatCurrency(item.revenue, { compact: true })}</span>
                                <span className="text-green-600 font-bold">{item.roi}x ROI</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AnalyticsSection>
    );
};

export default PlatformROI;

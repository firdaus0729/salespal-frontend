import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AnalyticsSection from '../AnalyticsSection';

const CreditTrends = ({ data }) => {
    return (
        <AnalyticsSection
            title="Credit Consumption Trends"
            subtitle="Resource utilization over the last 30 days"
        >
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                        />
                        <Tooltip />
                        <Legend iconType="circle" />
                        <Area
                            name="AI Calls"
                            type="monotone"
                            dataKey="calls"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorCalls)"
                            strokeWidth={2}
                        />
                        <Area
                            name="WhatsApp"
                            type="monotone"
                            dataKey="whatsapp"
                            stroke="#10b981"
                            fillOpacity={0.1}
                            fill="#10b981"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <p>Peak usage detected on weekends (+24%)</p>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Calls</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> WhatsApp</span>
                </div>
            </div>
        </AnalyticsSection>
    );
};

export default CreditTrends;

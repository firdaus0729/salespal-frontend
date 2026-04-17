import React, { useState, useEffect } from 'react';
import { Loader2, ArrowUpRight, Ticket, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import api from '../../lib/api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

const SupportAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const data = await api.get('/support/analytics');
                setAnalyticsData(data);
            } catch (err) {
                console.error("Failed to fetch support analytics data:", err);
                setAnalyticsData(null);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    const getMetricConfig = (title) => {
        switch (title) {
            case 'Total Tickets':
                return { icon: <Ticket className="w-5 h-5 text-blue-600" />, style: 'bg-blue-100' };
            case 'Resolution Rate':
                return { icon: <CheckCircle className="w-5 h-5 text-green-600" />, style: 'bg-green-100' };
            case 'Escalation Rate':
                return { icon: <AlertCircle className="w-5 h-5 text-red-600" />, style: 'bg-red-100' };
            case 'Avg Response Time':
                return { icon: <Clock className="w-5 h-5 text-yellow-600" />, style: 'bg-yellow-100' };
            default:
                return { icon: <Ticket className="w-5 h-5 text-gray-600" />, style: 'bg-gray-100' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const { 
        metrics = [
            { title: 'Total Tickets', value: '0' },
            { title: 'Resolution Rate', value: '0%' },
            { title: 'Escalation Rate', value: '0%' },
            { title: 'Avg Response Time', value: '0h' },
        ], 
        ticketTrend = [], 
        categoryData = [],
        statusData = []
    } = analyticsData || {};

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="space-y-3">
                <h1 className="text-xl font-semibold text-gray-900">Support Analytics</h1>
                <p className="text-sm text-gray-500">Track support performance and ticket trends.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const { icon, style } = getMetricConfig(metric.title);
                    return (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-lg ${style}`}>
                                    {icon}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="mt-4 text-2xl font-semibold text-gray-900">
                                {metric.value}
                            </div>

                            <div className="text-sm text-gray-500 mt-1">
                                {metric.title}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Chart Sections (Row 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Volume Trend */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 min-h-[300px] flex flex-col">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Ticket Volume Trend</h2>
                    <div className="flex-1 w-full min-h-[250px]">
                        {ticketTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ticketTrend}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                                    />
                                    <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No trend data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Tickets by Category */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 min-h-[300px] flex flex-col">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Tickets by Category</h2>
                    <div className="flex-1 w-full min-h-[250px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                                    <Tooltip 
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No category data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Sections (Row 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 min-h-[300px] flex flex-col">
                    <h2 className="text-sm font-medium text-gray-700 mb-4">Ticket Status Distribution</h2>
                    <div className="flex-1 w-full min-h-[250px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        label={true}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No status data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportAnalytics;

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsMetricCard = ({ label, value, trend, trendValue, icon: Icon, colorClass }) => {
    const isPositive = trend === 'up';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default AnalyticsMetricCard;

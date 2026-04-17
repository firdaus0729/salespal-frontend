import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({
    title,
    value,
    trend,
    trendLabel,
    icon: Icon,
    iconColor = 'text-blue-600',
    iconBg = 'bg-blue-50',
    onClick,
}) => {
    const isPositive = trend && !trend.startsWith('-');

    return (
        <div
            className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${
                onClick
                    ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
                    : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
                {Icon && (
                    <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon size={17} strokeWidth={1.5} className={iconColor} />
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && (
                <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                        isPositive ? 'text-emerald-600' : 'text-red-500'
                    }`}
                >
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{trend}</span>
                    {trendLabel && <span className="text-gray-400 font-normal">{trendLabel}</span>}
                </div>
            )}
        </div>
    );
};

export default MetricCard;

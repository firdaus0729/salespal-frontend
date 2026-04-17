import React from 'react';
import { Users, TrendingUp, MousePointer, Target, Activity, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import CurrencyIcon from '../../../../components/ui/CurrencyIcon';

const KPICard = ({ title, value, trend, percentageChange, isPositive, icon: Icon, color, onClick, isWarning, compareMode, previousValue }) => {

    const isUp = trend && trend.startsWith('+');
    const isNeutral = percentageChange === 0 || percentageChange === '0';

    let trendColor = 'text-gray-500';
    if (!isNeutral) {
        trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
    }

    const ArrowIcon = isUp ? ArrowUp : ArrowDown;

    return (
        <div
            onClick={onClick}
            className={`
                relative flex flex-row items-start gap-4 rounded-xl border bg-white p-5 cursor-pointer
                transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 min-h-[100px]
                ${isWarning ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 hover:border-indigo-100'}
            `}
        >
            {/* LEFT: Icon */}
            <div className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-lg ${color} bg-opacity-50 text-gray-700`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* RIGHT: Content */}
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    {isWarning && (
                        <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="w-3 h-3" /> Fatigue
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{value}</h3>
                
                {compareMode && previousValue !== undefined && (
                    <div className="mt-2 flex flex-col gap-1">
                        <div className={`flex items-center gap-1 text-sm font-medium whitespace-nowrap ${trendColor}`}>
                            {!isNeutral && <ArrowIcon className="w-4 h-4 text-current" />}
                            <span>{isUp ? '+' : (isNeutral ? '' : '-')}{percentageChange}% vs previous period</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 truncate">{previousValue} previous</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const KPISummary = ({ data, onDetailClick, mode = 'full', compareMode = false }) => {
    // Helper to render card if data exists
    const renderCard = (key, title, icon, color, label) => {
        if (!data[key]) return null;
        return (
            <KPICard
                key={key}
                title={title}
                value={data[key].value}
                trend={data[key].trend}
                percentageChange={data[key].percentageChange}
                isPositive={data[key].isPositive}
                icon={icon}
                color={color}
                onClick={() => onDetailClick(key, label || title)}
                isWarning={data[key].isFatigue}
                compareMode={compareMode}
                previousValue={data[key].previousValue}
            />
        );
    };

    const gridClass = mode === 'pulse'
        ? "grid grid-cols-2 lg:grid-cols-4 gap-4"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4";

    return (
        <div className={gridClass}>
            {/* 1. ROAS (Primary - Financial Health) */}
            {renderCard('roas', 'ROAS', Target, 'bg-indigo-100', 'Return on Ad Spend')}

            {/* 2. Total Revenue (Financial Health) - NEW */}
            {renderCard('totalRevenue', 'Total Revenue', TrendingUp, 'bg-emerald-100', 'Total Revenue')}

            {/* 3. Total Spend (Financial Health) */}
            {renderCard('totalSpend', 'Total Spend', CurrencyIcon, 'bg-red-100', 'Total Ad Spend')}

            {/* 4. CPA (Efficiency) - NEW */}
            {renderCard('cpa', 'Avg CPA', MousePointer, 'bg-blue-100', 'Cost Per Acquisition')}

            {/* Extended Metrics (Non-Pulse Mode Only) */}
            {mode !== 'pulse' && (
                <>
                    {renderCard('totalConversions', 'Conversions', Users, 'bg-purple-100', 'Total Conversions')}
                    {renderCard('frequency', 'Frequency', Activity, "bg-orange-100", 'Ad Frequency')}
                </>
            )}
        </div>
    );
};

export default KPISummary;

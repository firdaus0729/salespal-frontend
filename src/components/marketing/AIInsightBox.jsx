import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

const AIInsightBox = ({ insightData }) => {
    if (!insightData) return null;

    const { insight, recommendation, type } = insightData;

    let Icon = Lightbulb;
    let containerClass = 'bg-gray-50 border-gray-200 text-gray-800';
    let iconClass = 'text-gray-500 bg-gray-100';

    if (type === 'positive') {
        Icon = TrendingUp;
        containerClass = 'bg-emerald-50 border-emerald-100 text-emerald-900';
        iconClass = 'text-emerald-600 bg-emerald-100';
    } else if (type === 'negative') {
        Icon = AlertTriangle;
        containerClass = 'bg-rose-50 border-rose-100 text-rose-900';
        iconClass = 'text-rose-600 bg-rose-100';
    } else if (type === 'warning') {
        Icon = Activity;
        containerClass = 'bg-amber-50 border-amber-100 text-amber-900';
        iconClass = 'text-amber-600 bg-amber-100';
    }

    return (
        <div className={`mt-6 p-5 rounded-xl border flex items-start gap-4 shadow-sm transition-colors ${containerClass}`}>
            <div className={`p-2 rounded-lg shrink-0 ${iconClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-0.5">Performance Insight</h4>
                <p className="text-base font-medium leading-tight">{insight}</p>
                <p className="text-sm opacity-80">{recommendation}</p>
            </div>
        </div>
    );
};

export default AIInsightBox;

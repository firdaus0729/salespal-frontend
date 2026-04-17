import React from 'react';
import { Zap, AlertTriangle, Info, ArrowRight, CheckCircle } from 'lucide-react';

const SeverityBadge = ({ severity }) => {
    const config = {
        high: { color: 'bg-red-50 text-red-700 border-red-100', icon: AlertTriangle },
        medium: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Info },
        low: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Info }
    };
    const { color, icon: Icon } = config[severity] || config.low;

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
    );
};

const StreamCard = ({ insight, onAction }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-purple-200 transition-colors shadow-sm gap-4">
        <div className="flex items-start gap-4">
            <div className={`mt-1 p-2 rounded-lg ${insight.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                <Zap className="w-5 h-5" />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{insight.title}</h4>
                    <SeverityBadge severity={insight.severity} />
                </div>
                <p className="text-sm text-gray-600">{insight.desc}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                    <span>Scope: {insight.scope.name}</span>
                    <span className={insight.trend.includes('-') ? 'text-red-600' : 'text-green-600'}>
                        Trend: {insight.trend}
                    </span>
                </div>
            </div>
        </div>
        <button
            onClick={() => onAction(insight)}
            className="shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
            View Details
        </button>
    </div>
);

const AIInsightsStream = ({ insights, onAction }) => {
    if (!insights?.length) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">AI Insights Stream</h3>
                        <p className="text-xs text-gray-500 font-medium">Real-time performance intelligence</p>
                    </div>
                </div>
                <div className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {insights.length} New Insights
                </div>
            </div>

            <div className="space-y-3">
                {insights.map(insight => (
                    <StreamCard key={insight.id} insight={insight} onAction={onAction} />
                ))}
            </div>
        </div>
    );
};

export default AIInsightsStream;

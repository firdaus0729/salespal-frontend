import React, { useState } from 'react';
import { AlertCircle, X, ArrowRight, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const InsightItem = ({ insight, onDismiss }) => {
    const bgColors = {
        high: 'bg-red-50 border-red-100',
        medium: 'bg-amber-50 border-amber-100',
        low: 'bg-blue-50 border-blue-100'
    };
    const textColors = {
        high: 'text-red-700',
        medium: 'text-amber-700',
        low: 'text-blue-700'
    };
    const iconColors = {
        high: 'text-red-500',
        medium: 'text-amber-500',
        low: 'text-blue-500'
    };

    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${bgColors[insight.severity]} relative group animate-fade-in`}>
            <div className={`mt-0.5 ${iconColors[insight.severity]}`}>
                <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-sm font-bold ${textColors[insight.severity]}`}>{insight.title}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-white/50 rounded text-gray-500">
                        {insight.scope.name}
                    </span>
                </div>
                <p className="text-xs text-gray-600 leading-snug">{insight.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-bold flex items-center ${insight.trend.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                        {insight.trend}
                    </span>
                </div>
            </div>
            <button
                onClick={() => onDismiss(insight.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

const RecommendationItem = ({ action, onPreview }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 transition-colors shadow-sm group">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                <TrendingUp className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900">{action.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{action.impact[0]}</span>
                    <span>•</span>
                    <span className={action.risk === 'low' ? 'text-green-600' : 'text-amber-600'}>
                        Risk: {action.risk}
                    </span>
                </div>
            </div>
        </div>
        <button
            onClick={() => onPreview(action)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-blue-50 rounded"
        >
            Preview <ArrowRight className="w-3 h-3" />
        </button>
    </div>
);

const AIInsightsBanner = ({ insights, recommendations, onPreviewAction }) => {
    const [dismissedIds, setDismissedIds] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);

    const visibleInsights = insights.filter(i => !dismissedIds.includes(i.id));
    const hasContent = visibleInsights.length > 0 || recommendations.length > 0;

    if (!hasContent) return null;

    return (
        <div className="mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    AI Intelligence Stream
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                    {isExpanded ? 'Hide' : 'Show Insights'}
                </button>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Insights Column */}
                    {visibleInsights.slice(0, 2).map(insight => (
                        <InsightItem
                            key={insight.id}
                            insight={insight}
                            onDismiss={(id) => setDismissedIds(prev => [...prev, id])}
                        />
                    ))}

                    {/* Recommendations Column (Always visible if exists) */}
                    {recommendations.slice(0, 2).map(action => (
                        <RecommendationItem
                            key={action.id}
                            action={action}
                            onPreview={onPreviewAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIInsightsBanner;

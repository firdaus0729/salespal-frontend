import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const InsightIcon = ({ type }) => {
    switch (type) {
        case 'opportunity': return <Lightbulb className="w-4 h-4 text-blue-500" />;
        case 'efficiency': return <TrendingUp className="w-4 h-4 text-green-500" />;
        case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        default: return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
};

const AIFinancialInsights = ({ insights }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" /> AI Financial Intel
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Real-time Predictions</p>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase">Beta</span>
            </div>

            <div className="flex-1 p-6 space-y-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="group p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <InsightIcon type={insight.type} />
                                <span className="text-xs font-bold text-gray-900">{insight.title}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${insight.impact === 'High' ? 'bg-green-100 text-green-700' :
                                    insight.impact === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {insight.impact} Impact
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            {insight.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button className="w-full py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-600" /> Optimize Budget Now
                </button>
            </div>
        </div>
    );
};

export default AIFinancialInsights;

import React from 'react';
import AnalyticsSection from '../AnalyticsSection';
import { Zap, ArrowRight } from 'lucide-react';
import Button from '../../../../components/ui/Button';

const AIInsights = ({ insights }) => {
    return (
        <AnalyticsSection
            title="AI Insights"
            subtitle="Optimization opportunities"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map(insight => (
                    <div key={insight.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{insight.title}</h4>
                                <p className="text-xs text-amber-800 mt-1 mb-2">{insight.desc}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                                        {insight.impact}
                                    </span>
                                    <button className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-1">
                                        Apply Action <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AnalyticsSection>
    );
};

export default AIInsights;

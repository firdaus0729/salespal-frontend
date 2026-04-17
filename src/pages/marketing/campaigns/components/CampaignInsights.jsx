import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CampaignInsights() {
    const insights = [
        "Your cost per lead (CPL) is 12% lower than the industry average for SaaS B2B.",
        "LinkedIn audience 'Product Managers' is showing 2.4x higher engagement than 'Founders'.",
        "Ad creatives with blue backgrounds are outperforming other colors by 18% this week.",
        "Budget utilization is optimal. Consider increasing daily spread on weekends."
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">AI Performance Insights</h2>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

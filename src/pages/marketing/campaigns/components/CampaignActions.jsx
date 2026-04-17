import React from 'react';
import { Minimize2, RefreshCw, TrendingUp } from 'lucide-react';

export default function CampaignActions() {
    const actions = [
        {
            title: 'Optimize Budget',
            description: 'Automatically reallocate budget to high-performing ad sets',
            icon: Minimize2
        },
        {
            title: 'Rotate Creatives',
            description: 'Switch underperforming creatives with new AI-generated variants',
            icon: RefreshCw
        },
        {
            title: 'Scale Campaign',
            description: 'Increase reach by expanding to lookalike audiences',
            icon: TrendingUp
        }
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recommended Actions</h2>
                <p className="text-sm text-slate-500">AI-driven suggestions to improve campaign performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            disabled
                            className="flex flex-col items-start p-4 border border-slate-200 rounded-lg text-left hover:border-indigo-300 hover:bg-slate-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                        >
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mb-3 group-hover:bg-indigo-100 transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{action.description}</p>
                            <span className="mt-auto text-xs font-medium text-indigo-600">Available once AI optimization is enabled</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

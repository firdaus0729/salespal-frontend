import React from 'react';
import { Zap, RotateCcw, TrendingUp } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, subtext }) => (
    <button disabled className="w-full text-left p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed group relative overflow-hidden">
        <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <span className="block text-sm font-semibold text-gray-400 mb-0.5">{label}</span>
                <span className="block text-xs text-gray-400">{subtext}</span>
            </div>
        </div>
    </button>
);

const NextActionsPanel = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900">Recommended Actions</h3>
                <p className="text-xs text-gray-500 mt-1">AI optimization is active. Manual controls are temporarily locked.</p>
            </div>

            <div className="space-y-3">
                <ActionButton
                    icon={Zap}
                    label="Scale Winning Ad Set"
                    subtext="Increase budget by 20% on high performing sets"
                />
                <ActionButton
                    icon={RotateCcw}
                    label="Rotate Creatives"
                    subtext="Refresh ad fatigue with new variations"
                />
                <ActionButton
                    icon={TrendingUp}
                    label="Manual Bid Adjustment"
                    subtext="Override AI bid strategies"
                />
            </div>
        </div>
    );
};

export default NextActionsPanel;

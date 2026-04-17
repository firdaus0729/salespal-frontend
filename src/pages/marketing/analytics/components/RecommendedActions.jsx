import React from 'react';
import { Zap, ArrowRight, ShieldAlert } from 'lucide-react';

const ActionCard = ({ action, onPreview }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 group hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{action.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5">{action.target}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                {action.impact.map((imp, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">
                        {imp}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                    <ShieldAlert className="w-3 h-3" />
                    Risk: <span className={action.risk === 'low' ? 'text-green-600' : 'text-amber-600'}>{action.risk.toUpperCase()}</span>
                </div>
                <button
                    onClick={() => onPreview(action)}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                    Preview <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

const RecommendedActions = ({ actions, onPreviewAction }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Recommended Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions && actions.map(action => (
                    <ActionCard key={action.id} action={action} onPreview={onPreviewAction} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedActions;

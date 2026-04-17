import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';

const ActionPreviewView = ({ action }) => {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-blue-700">{action.subtext} • Target: {action.target}</p>
            </div>

            {/* Before vs After Simulation */}
            <div className="grid grid-cols-2 gap-4 items-center">
                {/* Before */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-70">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Current State</p>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-gray-400">Daily Spend</p>
                            <p className="font-mono text-sm font-medium text-gray-700">{action.previewData?.before?.spend}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Proj. Leads</p>
                            <p className="font-mono text-sm font-medium text-gray-700">{action.previewData?.before?.leads}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400">Est. CPL</p>
                            <p className="font-mono text-sm font-medium text-gray-700">{action.previewData?.before?.cpl}</p>
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-blue-300">
                    <ArrowRight className="w-8 h-8" />
                </div>

                {/* After */}
                <div className="border-2 border-green-100 rounded-lg p-4 bg-green-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                        PREDICTED
                    </div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">After Action</p>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] text-green-600 opacity-70">Daily Spend</p>
                            <p className="font-mono text-sm font-bold text-green-900">{action.previewData?.after?.spend}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-green-600 opacity-70">Proj. Leads</p>
                            <p className="font-mono text-sm font-bold text-green-900">{action.previewData?.after?.leads}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-green-600 opacity-70">Est. CPL</p>
                            <p className="font-mono text-sm font-bold text-green-900">{action.previewData?.after?.cpl}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 p-3 rounded border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Note:</strong> Applying this action will automatically update your ad set budget.
                    This change takes approximately 1 hour to reflect on the platform naturally.
                </p>
            </div>
        </div>
    );
};

export default ActionPreviewView;

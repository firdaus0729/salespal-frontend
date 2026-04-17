import React from 'react';
import { Sparkles } from 'lucide-react';

const LaunchConfirmation = ({ isConfirmed, onToggle }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">AI Optimization Engine</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Our AI will continuously monitor your campaign performance, adjusting bid strategies and creative rotation to maximize your ROI.
                </p>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            checked={isConfirmed}
                            onChange={(e) => onToggle(e.target.checked)}
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 select-none">
                        I approve AI-driven optimization and budget allocation for this campaign.
                    </span>
                </label>
            </div>
        </div>
    </div>
);

export default LaunchConfirmation;

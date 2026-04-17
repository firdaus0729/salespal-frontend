import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const RunningCampaignNotice = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="mb-8 bg-gradient-to-r from-secondary/5 to-white border border-secondary/20 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 mb-1">Campaign Launched Successfully!</h4>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                    SalesPal AI is now actively monitoring your campaign. Initial optimization data usually takes 24 hours to appear. We'll notify you when your first lead arrives.
                </p>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default RunningCampaignNotice;

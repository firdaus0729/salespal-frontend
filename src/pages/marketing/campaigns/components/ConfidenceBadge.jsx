import React from 'react';
import { Sparkles } from 'lucide-react';

const ConfidenceBadge = ({ score }) => {
    let colorClass, bgClass;
    if (score >= 90) {
        colorClass = 'text-green-600';
        bgClass = 'bg-green-100';
    } else if (score >= 70) {
        colorClass = 'text-yellow-600';
        bgClass = 'bg-yellow-100';
    } else {
        colorClass = 'text-red-600';
        bgClass = 'bg-red-100';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass} ${colorClass}`}>
            <Sparkles className="w-3 h-3" />
            {score}% AI Confidence
        </div>
    );
};

export default ConfidenceBadge;

import React from 'react';

const InsightRow = ({ label, value, subtext }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between py-2 border-b border-gray-100 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 block">{value}</span>
                {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
            </div>
        </div>
    );
};

export default InsightRow;

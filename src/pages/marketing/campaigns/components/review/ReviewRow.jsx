import React from 'react';

const ReviewRow = ({ label, value, subtext }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0">
        <span className="text-sm font-medium text-gray-500 w-1/3">{label}</span>
        <div className="text-right flex-1 pl-4">
            <span className="text-sm font-medium text-gray-900 block">{value}</span>
            {subtext && <span className="text-xs text-gray-400 mt-0.5 block">{subtext}</span>}
        </div>
    </div>
);

export default ReviewRow;

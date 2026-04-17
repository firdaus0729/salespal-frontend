import React from 'react';

const ChartCard = ({ title, subtitle, children, action, className = '' }) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
};

export default ChartCard;

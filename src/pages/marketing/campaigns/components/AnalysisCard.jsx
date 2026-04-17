import React from 'react';

const AnalysisCard = ({ title, icon: Icon, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-secondary">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default AnalysisCard;

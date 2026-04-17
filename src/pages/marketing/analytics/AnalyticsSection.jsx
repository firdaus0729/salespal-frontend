import React from 'react';

const AnalyticsSection = ({ title, subtitle, children, isEmpty = false, emptyMessage = "No data available" }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>

            <div className="p-6">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 bg-gray-50/30 rounded-lg border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-xl">📊</span>
                        </div>
                        <p className="font-medium text-gray-600">{emptyMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">Metrics will appear here once campaigns are active.</p>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default AnalyticsSection;

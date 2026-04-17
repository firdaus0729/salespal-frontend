import React from 'react';

const FinancialKPIs = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data).map(([key, item]) => (
                <div key={key} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${item.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {item.trend}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                        <p className="text-sm font-semibold text-gray-400 capitalize mt-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FinancialKPIs;

import React from 'react';
import AnalyticsSection from '../AnalyticsSection';
import { Target, Info } from 'lucide-react';

const AttributionModel = ({ data }) => {
    return (
        <AnalyticsSection
            title="Attribution Model"
            subtitle="How credit is assigned"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button className="px-3 py-1.5 text-xs font-semibold bg-white shadow-sm rounded-md text-gray-900">Last Click</button>
                    <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 cursor-not-allowed">First Click</button>
                    <button className="px-3 py-1.5 text-xs font-semibold text-gray-400 cursor-not-allowed">Linear</button>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Default: Last Click
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Credit is assigned to the last touchpoint before conversion.
                </p>
                <div className="space-y-3">
                    {data.breakdown.map((item) => (
                        <div key={item.channel}>
                            <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                                <span>{item.channel}</span>
                                <span>{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AnalyticsSection>
    );
};

export default AttributionModel;

import React from 'react';
import AnalyticsSection from '../AnalyticsSection';
import { ArrowDown } from 'lucide-react';

const FunnelStep = ({ label, value, rate, color, isLast, dropOff }) => (
    <div className="relative flex flex-col items-center flex-1">
        <div className={`w-full p-4 rounded-xl border-2 ${color} bg-white text-center z-10 relative shadow-sm`}>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        {!isLast && (
            <div className="my-2 flex flex-col items-center relative w-full">
                <div className="h-8 w-0.5 bg-gray-200"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-100 px-2 py-1 rounded shadow-sm flex flex-col items-center z-20 min-w-[80px]">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Conv.</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        {rate}
                    </div>
                    {dropOff && (
                        <div className="text-[10px] font-medium text-red-500 mt-0.5">
                            {dropOff} Drop-off
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

const ConversionFunnel = ({ data }) => {
    // Helper to calculate drop-off from rate string "3.0%"
    const getDropOff = (rateStr) => {
        const rate = parseFloat(rateStr);
        return isNaN(rate) ? '' : `-${(100 - rate).toFixed(1)}%`;
    };

    return (
        <AnalyticsSection
            title="Conversion Funnel"
            subtitle="Journey from impression to deal"
        >
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-0 mt-2 mb-4">
                <FunnelStep
                    label="Impressions"
                    value={data.impressions.toLocaleString()}
                    rate={data.rates.ctr}
                    dropOff={getDropOff(data.rates.ctr)}
                    color="border-blue-100"
                />
                <FunnelStep
                    label="Clicks"
                    value={data.clicks.toLocaleString()}
                    rate={data.rates.leadCvR}
                    dropOff={getDropOff(data.rates.leadCvR)}
                    color="border-purple-100"
                />
                <FunnelStep
                    label="Leads"
                    value={data.leads.toLocaleString()}
                    rate={data.rates.dealCvR}
                    dropOff={getDropOff(data.rates.dealCvR)}
                    color="border-amber-100"
                />
                <FunnelStep
                    label="Conversions"
                    value={data.conversions.toLocaleString()}
                    color="border-green-100"
                    isLast
                />
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                <p className="text-sm text-gray-500">
                    <strong>Insight:</strong> Your biggest drop-off is between <strong>Impressions</strong> and <strong>Clicks</strong> (-97%). Improve ad creatives.
                </p>
            </div>
        </AnalyticsSection>
    );
};

export default ConversionFunnel;

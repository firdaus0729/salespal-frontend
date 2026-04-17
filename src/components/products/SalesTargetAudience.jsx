import React from 'react';
import { Check } from 'lucide-react';

const targetAudiences = [
    "Real estate following up with property inquiries",
    "Education institutions handling admission queries",
    "Insurance companies qualifying leads",
    "Service businesses booking consultations"
];

const SalesTargetAudience = () => {
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Who Is This For?
                    </h2>
                    <p className="text-lg text-gray-600">
                        SalesPal Sales is perfect for businesses looking to scale their operations.
                    </p>
                </div>

                {/* Target Audience Box */}
                <div
                    className="bg-white rounded-2xl p-8 md:p-12"
                    style={{
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.08)'
                    }}
                >
                    <div className="space-y-6">
                        {targetAudiences.map((audience, index) => (
                            <div key={index} className="flex items-start gap-4">
                                {/* Check Icon Circle */}
                                <div
                                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.1)'
                                    }}
                                >
                                    <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                                </div>

                                {/* Text */}
                                <p className="text-base text-gray-700 leading-relaxed pt-1">
                                    {audience}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SalesTargetAudience;

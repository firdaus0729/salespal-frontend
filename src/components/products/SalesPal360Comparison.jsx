import React, { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

const STATIC_COMPARISON_DATA = [
    {
        aspect: "Tools Needed",
        traditional: "5-10 different tools",
        salespal: "1 unified platform"
    },
    {
        aspect: "Data Silos",
        traditional: "Disconnected everywhere",
        salespal: "Single source of truth"
    },
    {
        aspect: "Team Size",
        traditional: "10+ people full funnel",
        salespal: "2-3 people with AI"
    },
    // Total Cost row is computed dynamically
    {
        aspect: "Setup Time",
        traditional: "3-6 months",
        salespal: "1 week"
    }
];

const SalesPal360Comparison = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const { formatCurrency } = usePreferences();

    const comparisonData = [
        ...STATIC_COMPARISON_DATA.slice(0, 3),
        {
            aspect: 'Total Cost',
            traditional: `${formatCurrency(50000)}-${formatCurrency(100000)}/mo`,
            salespal: `${formatCurrency(29999)}/month`,
        },
        STATIC_COMPARISON_DATA[STATIC_COMPARISON_DATA.length - 1],
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 px-6 bg-gray-50"
        >
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Traditional Way vs <span className="text-blue-500">SalesPal</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        See why businesses are switching to AI-powered automation
                    </p>
                </div>

                {/* Table Container */}
                <div
                    className={`bg-white rounded-2xl overflow-hidden transition-all duration-800 ${isVisible ? 'animate-fade-in' : 'opacity-0'
                        }`}
                    style={{
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.08)'
                    }}
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                        <div className="font-semibold text-gray-900">Aspect</div>
                        <div className="font-semibold text-red-500 text-center">Traditional Way</div>
                        <div className="font-semibold text-blue-500 text-center">SalesPal</div>
                    </div>

                    {/* Table Rows */}
                    {comparisonData.map((row, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium text-gray-900">{row.aspect}</div>
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <X className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
                                <span className="text-sm text-center">{row.traditional}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-900">
                                <Check className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={2.5} />
                                <span className="text-sm font-medium text-center">{row.salespal}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default SalesPal360Comparison;

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { ScrollRevealHeading, ScrollRevealSubheading, ScrollRevealScale } from '../animations/ScrollReveal';
import useScrollReveal from '../../hooks/useScrollReveal';
import useReducedMotion from '../../hooks/useReducedMotion';
import { usePreferences } from '../../context/PreferencesContext';
import { usePricing } from '../../context/PricingContext';

const STATIC_COMPARISON_DATA = [
    {
        aspect: "Ad Creation Time",
        traditional: "4-8 hours per campaign",
        salespal: "Minutes with AI"
    },
    {
        aspect: "A/B Testing",
        traditional: "Manual, 2-3 variations",
        salespal: "Automated, 10+ variations"
    },
    {
        aspect: "Lead Response",
        traditional: "Hours to days",
        salespal: "Instant routing"
    },
    {
        aspect: "Campaign Optimization",
        traditional: "Weekly reviews",
        salespal: "Real-time AI optimization"
    },
    // Monthly Cost row is computed dynamically — see ComparisonTable component
];

const ComparisonTable = () => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();
    const { formatCurrency } = usePreferences();
    const { getMonthlyPrice } = usePricing();

    const basePrice = getMonthlyPrice('marketing') || 5999;

    const comparisonData = [
        ...STATIC_COMPARISON_DATA,
        {
            aspect: 'Monthly Cost',
            traditional: `${formatCurrency(50000)}+ (agency)`,
            salespal: `${formatCurrency(basePrice)}/month`,
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    };

    const rowVariants = {
        hidden: {
            opacity: 0,
            x: -15
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <section className="py-20 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <ScrollRevealHeading>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                            Traditional Way vs <span className="text-blue-500">SalesPal</span>
                        </h2>
                    </ScrollRevealHeading>
                    <ScrollRevealSubheading>
                        <p className="text-lg text-gray-600">
                            See why businesses are switching to AI-powered automation
                        </p>
                    </ScrollRevealSubheading>
                </div>

                {/* Table Container */}
                <ScrollRevealScale>
                    <div
                        className="bg-white rounded-2xl overflow-hidden"
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
                        <motion.div
                            ref={ref}
                            variants={prefersReducedMotion ? {} : containerVariants}
                            initial="hidden"
                            animate={isVisible ? "visible" : "hidden"}
                        >
                            {comparisonData.map((row, index) => (
                                <motion.div
                                    key={index}
                                    className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100 last:border-b-0 transition-colors"
                                    variants={prefersReducedMotion ? {} : rowVariants}
                                    whileHover={prefersReducedMotion ? {} : {
                                        backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                        transition: {
                                            duration: 0.15,
                                            ease: [0.22, 1, 0.36, 1]
                                        }
                                    }}
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
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </ScrollRevealScale>
            </div>
        </section>
    );
};

export default ComparisonTable;

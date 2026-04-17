import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import Button from '../ui/Button';

const Upsell360Section = ({ onSwitch, show }) => {
    if (!show) return null;

    const benefits = [
        'All modules included',
        'Unified billing',
        'Priority support',
        'Extended limits'
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 rounded-2xl border border-purple-200 shadow-md"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-200">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Upgrade to SalesPal 360
                                </h3>
                                <p className="text-sm text-purple-600 font-medium">
                                    Get Everything in One Plan
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            You have multiple active plans. Consolidate them into SalesPal 360 to get all modules
                            with unified billing and exclusive premium features.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={benefit}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-1.5 text-sm text-gray-700"
                                >
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Button
                            onClick={onSwitch}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-200 whitespace-nowrap group"
                        >
                            Switch to 360
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Upsell360Section;

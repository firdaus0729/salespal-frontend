import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Minus, Crown } from 'lucide-react';

const comparisonData = [
    { label: "Campaign Limit", marketing: "30/mo", sales: "—", postSale: "—", support: "—", salespal360: "150/mo" },
    { label: "AI Content (Images + Scripts)", marketing: "20/mo", sales: "10/mo", postSale: "—", support: "—", salespal360: "100/mo" },
    { label: "WhatsApp Messages", marketing: "300/mo", sales: "200/mo", postSale: "200/mo", support: "—", salespal360: "500/mo" },
    { label: "Call Credits", marketing: "500/mo", sales: "500/mo", postSale: "—", support: "—", salespal360: "1000/mo" },
    { label: "Leads Managed", marketing: "—", sales: "500", postSale: "—", support: "—", salespal360: "Unlimited" },
    { label: "Customers Managed", marketing: "—", sales: "—", postSale: "500", support: "—", salespal360: "Unlimited" },
    { label: "Support Tickets", marketing: "—", sales: "—", postSale: "—", support: "500/mo", salespal360: "Unlimited" },
    { label: "Campaign Creation", marketing: "check", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Social Media Management", marketing: "check", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Lead Management", marketing: "—", sales: "check", postSale: "—", support: "—", salespal360: "check" },
    { label: "Sales Pipeline", marketing: "—", sales: "check", postSale: "—", support: "—", salespal360: "check" },
    { label: "AI Calling / Scripts", marketing: "—", sales: "check", postSale: "—", support: "—", salespal360: "check" },
    { label: "WhatsApp Automation", marketing: "—", sales: "check", postSale: "—", support: "—", salespal360: "check" },
    { label: "Customer Management", marketing: "—", sales: "—", postSale: "check", support: "—", salespal360: "check" },
    { label: "Onboarding Flows", marketing: "—", sales: "—", postSale: "check", support: "—", salespal360: "check" },
    { label: "Payment Tracking", marketing: "—", sales: "—", postSale: "check", support: "—", salespal360: "check" },
    { label: "Post-Sales Automation", marketing: "—", sales: "—", postSale: "check", support: "—", salespal360: "check" },
    { label: "Support Ticketing", marketing: "—", sales: "—", postSale: "—", support: "check", salespal360: "check" },
    { label: "Ticket Analytics", marketing: "—", sales: "—", postSale: "—", support: "check", salespal360: "check" },
    { label: "Analytics Dashboard", marketing: "check", sales: "check", postSale: "check", support: "check", salespal360: "check" },
    { label: "AI Insights", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "API Access", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Unified Dashboard", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Multi-Module Integration", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Email Support", marketing: "check", sales: "check", postSale: "check", support: "check", salespal360: "check" },
    { label: "Priority Support", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
    { label: "Dedicated Success Manager", marketing: "—", sales: "—", postSale: "—", support: "—", salespal360: "check" },
];

const plans = [
    { key: 'marketing', name: 'Marketing' },
    { key: 'sales', name: 'Sales' },
    { key: 'postSale', name: 'Post-Sales' },
    { key: 'support', name: 'Support' },
    { key: 'salespal360', name: 'SalesPal 360', highlight: true }
];

const PlanComparisonTable = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const renderValue = (value, isHighlighted = false) => {
        if (value === 'check') {
            return (
                <div className="flex items-center justify-center">
                    <div className={`p-1 rounded-full ${isHighlighted ? 'bg-emerald-200' : 'bg-emerald-100'}`}>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                </div>
            );
        }
        if (value === '—') {
            return (
                <div className="flex items-center justify-center">
                    <Minus className="w-4 h-4 text-gray-300" />
                </div>
            );
        }
        return (
            <span className={`text-sm font-medium ${isHighlighted ? 'text-indigo-700' : 'text-gray-700'}`}>
                {value}
            </span>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <Crown className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">Compare Plans</h3>
                        <p className="text-sm text-gray-500">See what each plan unlocks — or go all-in with SalesPal 360</p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 bg-gray-100 rounded-lg"
                >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6">
                            <div className="overflow-x-auto -mx-6 px-6">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 w-[200px]">
                                                Feature
                                            </th>
                                            {plans.map((plan) => (
                                                <th
                                                    key={plan.key}
                                                    className={`py-4 px-3 text-center text-sm font-semibold ${
                                                        plan.highlight
                                                            ? 'bg-indigo-50 text-indigo-700'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span>{plan.name}</span>
                                                        {plan.highlight && (
                                                            <span className="text-xs font-medium text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                                                                Best Value
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonData.map((row, index) => (
                                            <tr
                                                key={row.label}
                                                className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                                                    index === comparisonData.length - 1 ? 'border-b-0' : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                                                    {row.label}
                                                </td>
                                                {plans.map((plan) => (
                                                    <td
                                                        key={plan.key}
                                                        className={`py-3 px-3 text-center ${
                                                            plan.highlight ? 'bg-indigo-50/50' : ''
                                                        }`}
                                                    >
                                                        {renderValue(row[plan.key], plan.highlight)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PlanComparisonTable;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Play } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import OnboardingProgress from './components/OnboardingProgress';
import OnboardingFlow from './onboarding/OnboardingFlow';

const statusColors = {
    'New': 'bg-violet-50 text-violet-700',
    'Onboarding': 'bg-blue-50 text-blue-700',
};

const Onboarding = () => {
    const { customers, onboardingFlows } = usePostSales();
    const [activeCustomer, setActiveCustomer] = useState(null);

    const onboardingCustomers = customers.filter(c => c.status === 'New' || c.status === 'Onboarding');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-indigo-500" /> Onboarding Pipeline
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">{onboardingCustomers.length} customers in onboarding</p>
            </div>

            {onboardingCustomers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                    <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No customers currently in onboarding.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {onboardingCustomers.map((c, i) => {
                        const flow = onboardingFlows[c.id] || { stepIndex: 0, completedSteps: [] };
                        const pct = Math.round((flow.completedSteps.length / 5) * 100);
                        return (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                                            {c.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                                            <p className="text-xs text-gray-400">{c.company}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Step {flow.stepIndex + 1} of 5</span>
                                        <span className="font-semibold text-indigo-600">{pct}%</span>
                                    </div>
                                    <OnboardingProgress completedSteps={flow.completedSteps} stepIndex={flow.stepIndex} compact />
                                </div>

                                <OnboardingProgress completedSteps={flow.completedSteps} stepIndex={flow.stepIndex} />

                                <button onClick={() => setActiveCustomer(c)}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl transition-colors">
                                    <Play className="w-3.5 h-3.5" /> Continue Onboarding
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {activeCustomer && <OnboardingFlow customer={activeCustomer} onClose={() => setActiveCustomer(null)} />}
        </div>
    );
};

export default Onboarding;

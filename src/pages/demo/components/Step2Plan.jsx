import React, { useState } from 'react';
import { Megaphone, Phone, Layers, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';

const plans = [
    {
        id: 'marketing',
        name: 'Marketing',
        description: 'Lead gen & qualification agent',
        icon: Megaphone,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-500 ring-2 ring-blue-500'
    },
    {
        id: 'sales',
        name: 'Sales',
        description: 'Outbound calling & closing',
        icon: Phone,
        color: 'text-green-500',
        bg: 'bg-green-50',
        border: 'border-green-200',
        activeBorder: 'border-green-500 ring-2 ring-green-500'
    },
    {
        id: 'full_suite',
        name: 'Full Suite',
        description: 'End-to-end revenue automation',
        icon: Layers,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        activeBorder: 'border-purple-500 ring-2 ring-purple-500'
    }
];

const Step2Plan = ({ formData, updateFormData, onNext, onBack }) => {
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const isValid = formData.plan !== '';

    const handleNext = () => {
        setAttemptedSubmit(true);
        if (isValid) onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Select AI Persona</h2>
                <p className="text-gray-500 mt-2">What role should the AI take during this demo?</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isActive = formData.plan === plan.id;

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateFormData({ plan: plan.id })}
                            className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 flex flex-col items-center text-center ${isActive ? plan.activeBorder : `border-gray-200 hover:border-gray-300 hover:shadow-md ${attemptedSubmit && !isValid ? 'border-red-200' : ''}`
                                }`}
                        >
                            <div className={`w-14 h-14 rounded-full ${plan.bg} flex items-center justify-center mb-4`}>
                                <Icon className={`w-7 h-7 ${plan.color}`} />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                            <p className="text-xs text-gray-500">{plan.description}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Validation Error */}
            <AnimatePresence>
                {attemptedSubmit && !isValid && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Please select an AI persona to continue.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-8 flex gap-4 justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={attemptedSubmit && !isValid}
                    className={`px-8 ${attemptedSubmit && !isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Continue to Property
                </Button>
            </div>
        </div>
    );
};

export default Step2Plan;

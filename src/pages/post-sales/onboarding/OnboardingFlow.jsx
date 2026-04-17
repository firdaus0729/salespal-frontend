import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { usePostSales } from '../../../context/PostSalesContext';
import StepWelcome from './StepWelcome';
import StepDocumentCollection from './StepDocumentCollection';
import StepAgreement from './StepAgreement';
import StepPaymentSetup from './StepPaymentSetup';
import StepActivation from './StepActivation';
import OnboardingProgress from '../components/OnboardingProgress';

const STEPS = [StepWelcome, StepDocumentCollection, StepAgreement, StepPaymentSetup, StepActivation];

const OnboardingFlow = ({ customer, onClose }) => {
    const { onboardingFlows, updateOnboarding } = usePostSales();
    const flow = onboardingFlows[customer.id] || { stepIndex: 0, completedSteps: [] };
    const [stepIndex, setStepIndex] = useState(flow.stepIndex);
    const [completedSteps, setCompletedSteps] = useState(flow.completedSteps);
    const [direction, setDirection] = useState(1);

    const CurrentStep = STEPS[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === STEPS.length - 1;
    const isCurrentCompleted = completedSteps.includes(stepIndex);

    const goNext = () => {
        if (!isCurrentCompleted) {
            const newCompleted = [...completedSteps, stepIndex];
            setCompletedSteps(newCompleted);
            if (!isLast) {
                const nextIdx = stepIndex + 1;
                setDirection(1);
                setStepIndex(nextIdx);
                updateOnboarding(customer.id, nextIdx, newCompleted);
            } else {
                updateOnboarding(customer.id, stepIndex, newCompleted);
            }
        } else if (!isLast) {
            setDirection(1);
            setStepIndex(s => s + 1);
        }
    };

    const goBack = () => {
        if (!isFirst) {
            setDirection(-1);
            setStepIndex(s => s - 1);
        }
    };

    const canGoNext = isCurrentCompleted ? !isLast : true;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-white font-bold text-lg">Customer Onboarding</h2>
                            <p className="text-indigo-200 text-sm mt-0.5">{customer.name} — {customer.company}</p>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <OnboardingProgress completedSteps={completedSteps} stepIndex={stepIndex} />
                </div>

                {/* Step Content */}
                <div className="p-6 min-h-[320px] overflow-y-auto">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={stepIndex}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -40 }}
                            transition={{ duration: 0.25 }}
                        >
                            <CurrentStep customer={customer} onComplete={goNext} isCompleted={isCurrentCompleted} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={goBack}
                        disabled={isFirst}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={goNext}
                        disabled={isLast && isCurrentCompleted}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all"
                    >
                        {isLast ? (isCurrentCompleted ? 'Completed ✓' : 'Activate') : isCurrentCompleted ? 'Next' : 'Complete & Next'}
                        {!isLast && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingFlow;

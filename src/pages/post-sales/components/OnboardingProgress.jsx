import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';

const STEPS = ['Welcome', 'Documents', 'Agreement', 'Payment', 'Activation'];

const OnboardingProgress = ({ completedSteps = [], stepIndex = 0, compact = false }) => {
    if (compact) {
        const pct = Math.round((completedSteps.length / STEPS.length) * 100);
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{completedSteps.length}/{STEPS.length} steps</span>
                    <span className="font-semibold text-indigo-600">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center w-full">
            {STEPS.map((step, i) => {
                const isCompleted = completedSteps.includes(i);
                const isCurrent = stepIndex === i && !isCompleted;
                const isLocked = i > stepIndex && !isCompleted;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-1.5">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2
                  ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : isCurrent ? 'bg-white border-indigo-500 text-indigo-600 shadow-md'
                                            : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : i + 1}
                            </motion.div>
                            <span className={`text-xs font-medium whitespace-nowrap ${isCompleted ? 'text-indigo-600' : isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 mb-5 mx-1">
                                <motion.div
                                    className={`h-full ${isCompleted ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                    initial={false}
                                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                                    style={{ transformOrigin: 'left', scaleX: isCompleted ? 1 : 0 }}
                                    transition={{ duration: 0.4 }}
                                />
                                {!isCompleted && <div className="h-full bg-gray-200" />}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default OnboardingProgress;

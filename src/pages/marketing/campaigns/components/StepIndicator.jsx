import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <React.Fragment key={index}>
                        {/* Step Item */}
                        <div className="flex items-center gap-2.5 z-10 shrink-0">
                            <div
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 shadow-sm
                                    ${isCompleted
                                        ? 'bg-secondary border-secondary text-primary'
                                        : isCurrent
                                            ? 'bg-primary border-primary text-white scale-105 shadow-md'
                                            : 'bg-white border-gray-200 text-gray-400'
                                    }
                                `}
                            >
                                {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index + 1}
                            </div>
                            <span
                                className={`
                                    text-[13px] font-semibold hidden lg:block transition-colors duration-300
                                    ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connecting Line (except after last item) */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-3 lg:mx-4 relative rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-secondary transition-all duration-500 ease-in-out"
                                    style={{ width: isCompleted ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;

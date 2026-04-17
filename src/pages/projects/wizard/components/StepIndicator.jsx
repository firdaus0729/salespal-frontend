import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
            {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                    <div key={idx} className="flex items-center w-full last:w-auto">
                        <div className="relative flex items-center justify-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10
                ${isActive ? 'bg-secondary text-primary border-secondary shadow-[0_0_15px_rgba(118,247,197,0.3)]' : ''}
                ${isCompleted ? 'bg-secondary text-primary border-secondary' : ''}
                ${!isActive && !isCompleted ? 'bg-primary border-white/10 text-gray-500' : ''}
                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                            </div>
                            <span className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap transition-colors duration-300
                ${isActive ? 'text-secondary' : 'text-gray-500'}
              `}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 transition-all duration-500
                ${isCompleted ? 'bg-secondary' : 'bg-white/10'}
              `}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;

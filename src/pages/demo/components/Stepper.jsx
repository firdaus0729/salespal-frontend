import React from 'react';
import { Check } from 'lucide-react';

const steps = [
    'Contact Info',
    'Plan Context',
    'Property Input',
    'Script Setup',
    'Start Demo'
];

const Stepper = ({ currentStep }) => {
    const percentage = Math.round((currentStep / (steps.length - 1)) * 100);

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Demo Progress</h2>
                <span className="text-sm font-bold text-blue-600">{percentage}% Complete</span>
            </div>

            <div className="relative pt-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0 mt-1"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out mt-1"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>

                <div className="relative z-10 flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div key={index} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300 ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                                        isCurrent ? 'bg-white border-blue-600 text-blue-600 scale-110 shadow-sm' :
                                            'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {isCompleted ? <Check className="w-4 h-4 animate-fadeIn" /> : (index + 1)}
                                </div>
                                <span className={`mt-2 text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Stepper;

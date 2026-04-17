import React, { useState } from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';

const StepPaymentSetup = ({ customer, onComplete, isCompleted }) => {
    const [method, setMethod] = useState('credit_card');

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Payment Setup</h3>
                <p className="text-sm text-gray-500 mt-1">Choose your preferred payment method.</p>
            </div>
            {!isCompleted && (
                <>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'credit_card', label: 'Credit Card', icon: '💳' },
                            { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
                            { value: 'upi', label: 'UPI', icon: '📱' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setMethod(opt.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
                  ${method === opt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                            >
                                <span className="text-2xl">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Plan: <span className="text-gray-900">{customer.plan}</span></span>
                        </div>
                        <div className="text-xs text-gray-400">* Payment details will be collected securely via our payment gateway</div>
                    </div>
                    <button onClick={onComplete}
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                        Confirm Payment Method
                    </button>
                </>
            )}
            {isCompleted && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Payment method configured successfully
                </div>
            )}
        </div>
    );
};

export default StepPaymentSetup;

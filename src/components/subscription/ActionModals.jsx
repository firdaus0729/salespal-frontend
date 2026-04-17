import React, { useState } from 'react';
import { X, AlertTriangle, PauseCircle, Calendar } from 'lucide-react';
import Button from '../ui/Button';

// Overlay helper
const ModalOverlay = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className={`relative z-10 bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-200 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export const PauseSubscriptionModal = ({ isOpen, onClose, onConfirm, planName, renewalDate }) => {
    const [duration, setDuration] = useState('next_billing'); // 'next_billing', '1_month', '3_months'

    const handleConfirm = () => {
        let months = 0;
        if (duration === '1_month') months = 1;
        if (duration === '3_months') months = 3;
        // next_billing is handled as special case or 0 in context helper
        onConfirm(duration === 'next_billing' ? 'next_billing' : months);
    };

    const formattedDate = renewalDate ? new Date(renewalDate).toLocaleDateString() : 'Next Billing';

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <PauseCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Pause Subscription</h3>
                            <p className="text-sm text-gray-500 font-medium">{planName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Your plan will stop renewing and usage limits will be frozen immediately.
                    Data is retained and you can resume anytime.
                </p>

                <div className="space-y-3 mb-8">
                    <div
                        className={`
                            flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                            ${duration === 'next_billing' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => setDuration('next_billing')}
                    >
                        <input
                            type="radio"
                            name="pause_duration"
                            checked={duration === 'next_billing'}
                            onChange={() => { }}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 pointer-events-none bg-white"
                        />
                        <div className="ml-3 select-none">
                            <span className="block text-sm font-semibold text-gray-900">Until next billing date</span>
                            <span className="block text-xs text-gray-500 mt-0.5">Automatically resume on {formattedDate}</span>
                        </div>
                    </div>

                    <div
                        className={`
                            flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                            ${duration === '1_month' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => setDuration('1_month')}
                    >
                        <input
                            type="radio"
                            name="pause_duration"
                            checked={duration === '1_month'}
                            onChange={() => { }}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 pointer-events-none bg-white"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-900 select-none">Pause for 1 Month</span>
                    </div>

                    <div
                        className={`
                            flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                            ${duration === '3_months' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                        onClick={() => setDuration('3_months')}
                    >
                        <input
                            type="radio"
                            name="pause_duration"
                            checked={duration === '3_months'}
                            onChange={() => { }}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 pointer-events-none bg-white"
                        />
                        <span className="ml-3 text-sm font-semibold text-gray-900 select-none">Pause for 3 Months</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 justify-center py-2.5" onClick={onClose}>Keep Active</Button>
                    <Button variant="warning" className="flex-1 justify-center py-2.5 shadow-amber-200" onClick={handleConfirm}>
                        Confirm Pause
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

export const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, planName, renewalDate }) => {
    const [acknowledged, setAcknowledged] = useState(false);
    const formattedDate = renewalDate ? new Date(renewalDate).toLocaleDateString() : 'end of cycle';

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Cancel Subscription?</h3>
                            <p className="text-sm text-gray-500 font-medium">{planName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-900 font-bold">You will lose access at the end of the billing cycle.</p>
                            <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                Your access will remain active until <strong>{formattedDate}</strong>.
                                After this date, you will lose access to premium features and data retention.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors mb-8 select-none border border-transparent hover:border-gray-200"
                    onClick={() => setAcknowledged(!acknowledged)}
                >
                    <div className="relative flex items-center h-5 mt-0.5">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={() => { }} // Controlled by parent div
                            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 pointer-events-none"
                        />
                    </div>
                    <span className="text-sm text-gray-700 font-medium leading-tight">
                        I understand that this action cannot be undone and I may lose access to my data.
                    </span>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 justify-center py-2.5" onClick={onClose}>Keep Subscription</Button>
                    <Button
                        variant={acknowledged ? 'destructive' : 'secondary'}
                        className="flex-1 justify-center py-2.5"
                        onClick={acknowledged ? onConfirm : undefined}
                        disabled={!acknowledged}
                    >
                        Confirm Cancel
                    </Button>
                </div>
            </div>
        </ModalOverlay>
    );
};

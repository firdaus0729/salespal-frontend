import React, { useState } from 'react';
import { CheckCircle, FileText } from 'lucide-react';

const StepAgreement = ({ customer, onComplete, isCompleted }) => {
    const [agreed, setAgreed] = useState(isCompleted);

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Service Agreement</h3>
                <p className="text-sm text-gray-500 mt-1">Review and accept the terms and conditions to proceed.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-40 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    SalesPal Service Agreement
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    This Service Agreement ("Agreement") is entered into between SalesPal Inc. and {customer.company} ("Client").
                    SalesPal agrees to provide the {customer.plan} Plan services as described. Client agrees to pay the agreed fees
                    on time. This agreement is valid for the subscription period and automatically renews. Either party may terminate
                    with 30 days written notice. All data remains the property of the Client. SalesPal provides 99.9% uptime SLA.
                    Support is provided per the chosen plan tier. By proceeding, you agree to all the terms herein.
                </p>
            </div>
            {!isCompleted && (
                <>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">I have read and agree to the Service Agreement</span>
                    </label>
                    <button
                        onClick={onComplete}
                        disabled={!agreed}
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Accept Agreement
                    </button>
                </>
            )}
            {isCompleted && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Agreement accepted by {customer.name}
                </div>
            )}
        </div>
    );
};

export default StepAgreement;

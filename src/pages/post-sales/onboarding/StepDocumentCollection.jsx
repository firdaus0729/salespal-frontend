import React from 'react';
import { CheckCircle } from 'lucide-react';
import DocumentUploader from '../components/DocumentUploader';

const StepDocumentCollection = ({ customer, onComplete, isCompleted }) => (
    <div className="space-y-5">
        <div>
            <h3 className="text-lg font-bold text-gray-900">Document Collection</h3>
            <p className="text-sm text-gray-500 mt-1">Please upload the required documents for verification.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
            {['KYC', 'GST', 'PAN'].map(type => (
                <div key={type} className={`rounded-xl border p-3 text-center text-xs font-semibold ${isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {isCompleted && <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-500" />}
                    {type}
                    {isCompleted ? ' ✓' : ' Required'}
                </div>
            ))}
        </div>
        {!isCompleted && (
            <>
                <DocumentUploader customerId={customer.id} />
                <button onClick={onComplete}
                    className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                    Mark Documents Submitted
                </button>
            </>
        )}
        {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Documents submitted successfully!
            </div>
        )}
    </div>
);

export default StepDocumentCollection;

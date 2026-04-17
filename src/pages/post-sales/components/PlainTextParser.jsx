import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Check, AlertCircle } from 'lucide-react';
import { usePostSales } from '../../../context/PostSalesContext';
import api from '../../../lib/api';

const PlainTextParser = ({ onCancel, onSuccess }) => {
    const { addCustomer } = usePostSales();
    const [text, setText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');

    const handleParse = async () => {
        if (!text.trim()) return;

        setIsParsing(true);
        setError('');

        try {
            // Call the backend API to analyze the text
            const response = await api.post('/post-sales/analyze/text', {
                text: text.trim()
            });

            if (response.data && response.data.data) {
                const extractedData = response.data.data;
                
                // Format the data for ExtractedDetailsView
                const formattedData = {
                    name: extractedData.name || '',
                    phone: extractedData.phone || '',
                    email: extractedData.email || '',
                    company: extractedData.company || '',
                    totalDue: extractedData.totalDue || 0,
                    amountPaid: extractedData.amountPaid || 0,
                    remaining: extractedData.remaining || 0,
                    dueDate: extractedData.dueDate ? new Date(extractedData.dueDate).toISOString() : new Date().toISOString(),
                    currency: extractedData.currency || 'INR',
                    notes: extractedData.notes || '',
                    status: 'active'
                };

                setIsParsing(false);
                if (onSuccess) onSuccess(formattedData, 'single');
            }
        } catch (err) {
            console.error('Error analyzing text:', err);
            setError(err.message || 'Failed to analyze text. Please try again.');
            setIsParsing(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Describe the Payment Details</h2>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 flex-1 min-h-[360px] flex flex-col justify-center">
                    <div className="space-y-3 w-full">
                        <label className="block text-sm font-semibold text-slate-800">
                            Describe the payment details in your own words
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isParsing}
                            placeholder='e.g., "Amit owes 32,000. Paid 12,000. Balance due on 18th. His number is 9876543210. Email: amit@example.com"'
                            className="w-full h-32 p-4 bg-gray-50/50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-shadow text-sm text-slate-700 shadow-sm placeholder:text-gray-400 disabled:opacity-50"
                        />
                        <p className="text-[13px] text-gray-500 pt-1">
                            AI will extract customer name, phone, email, amounts, and due date from your text.
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white mt-auto">
                    <button
                        onClick={onCancel}
                        disabled={isParsing}
                        className="px-6 py-2 border border-gray-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleParse}
                        disabled={!text.trim() || isParsing}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isParsing ? 'bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {isParsing ? (
                            <>
                                <Loader2 className="w-4 h-4 text-white/90 animate-spin" /> AI is thinking...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-white/90" /> Process with AI <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PlainTextParser;

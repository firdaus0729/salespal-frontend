import React from 'react';
import { X, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';
import Button from '../../../../../components/ui/Button';

const CreditWarningModal = ({ isOpen, onClose, onConfirm, format = 'image' }) => {
    if (!isOpen) return null;

    const getCreditsCost = () => {
        switch (format) {
            case 'video': return 3;
            case 'carousel': return 2;
            case 'image': default: return 1;
        }
    };

    const cost = getCreditsCost();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-in">
                {/* Header */}
                <div className="bg-amber-50 border-b border-amber-100 p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Use Ad Credits?
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                        Generating this preview will use <strong>{cost} ad credit{cost > 1 ? 's' : ''}</strong>.
                        AI-generated {format} previews are deducted from your monthly allowance.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-900 mb-1">Want to save credits?</p>
                            <p className="text-gray-500">You can upload your own media or use our demo preview mode to test layouts without spending credits.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            className="w-full justify-center py-3"
                        >
                            Continue & Generate Preview
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-sm font-medium py-2 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditWarningModal;

import React from 'react';
import { Sparkles, X } from 'lucide-react';

export default function ActionResultBanner({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg mb-6 animate-fade-in-up flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-white">AI Optimization Applied</h4>
                    <p className="text-indigo-100 text-sm">{message}</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
                <X className="w-5 h-5 text-indigo-100" />
            </button>
        </div>
    );
}

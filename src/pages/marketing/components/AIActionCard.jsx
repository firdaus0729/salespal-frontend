import React from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export default function AIActionCard({ action, onApply, isApplied }) {
    const { title, description, impact, type } = action;

    return (
        <div className={`p-5 rounded-xl border transition-all ${isApplied ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${isApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {isApplied ? <Check className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                {!isApplied && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                        {impact}
                    </span>
                )}
            </div>

            <h3 className={`font-semibold text-lg mb-1 ${isApplied ? 'text-emerald-900' : 'text-slate-900'}`}>{title}</h3>
            <p className={`text-sm mb-4 leading-relaxed ${isApplied ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isApplied ? 'Action applied successfully.' : description}
            </p>

            <button
                onClick={() => onApply(type)}
                disabled={isApplied}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isApplied
                        ? 'bg-transparent text-emerald-700 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
            >
                {isApplied ? (
                    'Applied'
                ) : (
                    <>
                        Apply Action
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
}

import React from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

const InputField = ({ label, value, onChange, placeholder, isTextArea = false }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isTextArea ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 min-h-[100px] text-sm"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-gray-400 text-sm"
            />
        )}
    </div>
);

const CopyEditor = ({ copyData, onChange }) => {
    const handleReset = () => {
        // In a real app, this would re-fetch AI suggestions. 
        // For now, we'll just set it back to the default "placeholder" state or keep it as UI only.
        console.log("Resetting to AI suggestion...");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900">AI Ad Copy</h3>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-secondary transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset to AI Suggestion
                </button>
            </div>

            <div className="space-y-4">
                <InputField
                    label="Primary Text"
                    value={copyData.primaryText}
                    onChange={(val) => onChange({ ...copyData, primaryText: val })}
                    placeholder="Enter the main text for your ad..."
                    isTextArea
                />
                <InputField
                    label="Headline"
                    value={copyData.headline}
                    onChange={(val) => onChange({ ...copyData, headline: val })}
                    placeholder="Short, catchy headline"
                />
                <InputField
                    label="Call to Action"
                    value={copyData.cta}
                    onChange={(val) => onChange({ ...copyData, cta: val })}
                    placeholder="e.g. Learn More, Sign Up"
                />
            </div>
        </div>
    );
};

export default CopyEditor;

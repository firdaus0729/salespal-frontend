import React from 'react';
import { Sparkles } from 'lucide-react';
import { usePreferences } from '../../../../../context/PreferencesContext';

const AIReasoningBox = () => {
    const { formatCurrency } = usePreferences();
    return (
        <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
                <h4 className="text-sm font-bold text-secondary-dark mb-1">Why this budget?</h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                    Based on current auction data in <strong>South Mumbai</strong> for real estate, we recommend a minimum of {formatCurrency(3500)}/day to achieve reliable lead volume across Meta and Google.
                </p>
            </div>
        </div>
    );
};

export default AIReasoningBox;

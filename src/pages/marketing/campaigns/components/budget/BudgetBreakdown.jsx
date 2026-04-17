import React from 'react';
import { usePreferences } from '../../../../../context/PreferencesContext';

const BudgetBreakdown = ({ platforms, dailyBudget }) => {
    const { formatCurrency } = usePreferences();
    if (platforms.length === 0) return null;

    // Mock logic to split budget
    const share = Math.floor(100 / platforms.length);
    const amount = Math.floor(dailyBudget / platforms.length);

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Allocation Breakdown</h4>
            <div className="space-y-2">
                {platforms.map(platform => (
                    <div key={platform} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                            {platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : 'YouTube'}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-secondary" style={{ width: `${share}%` }}></div>
                            </div>
                            <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetBreakdown;

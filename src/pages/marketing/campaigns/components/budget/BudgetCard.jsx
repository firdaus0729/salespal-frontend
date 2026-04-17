import React from 'react';
import { IndianRupee } from 'lucide-react';
import { usePreferences } from '../../../../../context/PreferencesContext';

const BudgetCard = ({ dailyBudget, setDailyBudget }) => {
    const monthlyEstimate = dailyBudget * 30.41;
    const { formatCurrency, currentCurrency } = usePreferences();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IndianRupee className="w-4 h-4" />
                    </div>
                    <input
                        type="number"
                        value={dailyBudget}
                        onChange={(e) => setDailyBudget(parseInt(e.target.value) || 0)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary text-lg font-semibold text-gray-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 font-medium sm:text-sm">
                        {currentCurrency.code} / day
                    </div>
                </div>
                <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(parseInt(e.target.value))}
                    className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Est. Monthly Spend</span>
                <span className="text-base font-bold text-gray-900">
                    {formatCurrency(monthlyEstimate, { decimals: 0 })}
                </span>
            </div>
        </div>
    );
};

export default BudgetCard;

import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';

/**
 * CurrencyIcon — renders the selected currency symbol as a styled element
 * that visually matches a Lucide icon (same size, same className support).
 *
 * Usage:
 *   <CurrencyIcon className="w-5 h-5 text-emerald-600" />
 *
 * The className is applied to a wrapping <span> so it inherits text color.
 * Font size is derived from the w-* class: w-4 → text-sm, w-5 → text-base, w-6 → text-lg.
 */
const CurrencyIcon = ({ className = 'w-5 h-5' }) => {
    const { currentCurrency } = usePreferences();
    const symbol = currentCurrency?.symbol || '₹';

    // Map Tailwind size classes to font sizes so the symbol scales correctly
    const sizeMap = {
        'w-3': 'text-[10px]',
        'w-4': 'text-xs',
        'w-5': 'text-sm',
        'w-6': 'text-base',
        'w-7': 'text-lg',
        'w-8': 'text-xl',
    };

    const sizeClass = Object.keys(sizeMap).find(k => className.includes(k)) || 'text-sm';
    const fontSize = sizeMap[sizeClass];

    return (
        <span
            className={`inline-flex items-center justify-center font-bold leading-none select-none ${fontSize} ${className}`}
            aria-hidden="true"
        >
            {symbol}
        </span>
    );
};

export default CurrencyIcon;

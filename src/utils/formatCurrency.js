/**
 * Central Currency Formatter for SalesPal
 *
 * Two usage patterns:
 *
 * 1. Inside React components — use the hook from PreferencesContext:
 *      const { formatCurrency } = usePreferences();
 *      formatCurrency(9999)  // → "₹9,999.00" or "$120.00" etc.
 *
 * 2. Outside React (utility scripts, tests) — call the standalone helper:
 *      import { formatCurrencyStatic } from './formatCurrency';
 *      formatCurrencyStatic(9999, { code: 'USD', symbol: '$', rate: 0.012 })
 */

/**
 * Standalone (non-hook) currency formatter.
 * Converts an INR base amount to the target currency and formats it.
 *
 * @param {number|string} amountInINR  - Raw amount stored in INR
 * @param {{ code: string, symbol: string, rate: number }} [currencyInfo]
 *   - Optional currency descriptor. Defaults to INR (rate = 1).
 * @param {{ compact?: boolean, decimals?: number }} [options]
 * @returns {string}
 */
export function formatCurrencyStatic(amountInINR, currencyInfo, options = {}) {
    const { compact = false, decimals } = options;

    // Defensive: null / undefined / empty
    if (amountInINR === null || amountInINR === undefined || amountInINR === '') {
        return '—';
    }

    const numValue = typeof amountInINR === 'string'
        ? parseFloat(amountInINR.replace(/[^0-9.-]/g, ''))
        : Number(amountInINR);

    if (isNaN(numValue)) return '—';

    const currency = currencyInfo || { code: 'INR', symbol: '₹', rate: 1 };
    const converted = numValue * (currency.rate ?? 1);

    // Decide decimal places
    const dp = decimals !== undefined
        ? decimals
        : currency.code === 'JPY' ? 0 : 2;

    try {
        if (compact) {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency.code,
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(converted);
        }

        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: dp,
            maximumFractionDigits: dp,
        }).format(converted);
    } catch (_) {
        return `${currency.symbol}${converted.toFixed(dp)}`;
    }
}

/**
 * Legacy INR-only formatter kept for backward compatibility.
 * Prefer usePreferences().formatCurrency() inside React components.
 *
 * @param {number|string} value
 * @param {{ compact?: boolean, decimals?: number }} [options]
 * @returns {string}
 */
export function formatCurrency(value, options = {}) {
    return formatCurrencyStatic(value, { code: 'INR', symbol: '₹', rate: 1 }, options);
}

/**
 * Formats a value as a percentage.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Formats a ROAS value with 'x' suffix.
 * @param {number} value
 * @returns {string}
 */
export function formatROAS(value) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${Number(value).toFixed(2)}x`;
}

/**
 * Formats a number with locale-aware formatting (no currency symbol).
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return new Intl.NumberFormat('en-IN').format(value);
}

export default formatCurrency;

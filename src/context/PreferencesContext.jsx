import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ─── Default Preferences ────────────────────────────────────────────────────
const DEFAULT_PREFERENCES = {
    language: 'en',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
};

const STORAGE_KEY = 'salespal_preferences';

// ─── Supported Languages ─────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'fr', label: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'de', label: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'pt', label: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'zh', label: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'ja', label: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
];

// ─── Supported Timezones ──────────────────────────────────────────────────────
export const SUPPORTED_TIMEZONES = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+5:30' },
    { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5:00' },
    { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6:00' },
    { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8:00' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+0:00' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1:00' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)', offset: 'UTC+1:00' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: 'UTC+4:00' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: 'UTC+8:00' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9:00' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: 'UTC+10:00' },
    { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)', offset: 'UTC+12:00' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+0:00' },
];

// ─── Supported Currencies ─────────────────────────────────────────────────────
export const SUPPORTED_CURRENCIES = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee', flag: '🇮🇳', rate: 1 },
    { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸', rate: 0.012 },
    { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺', rate: 0.011 },
    { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧', rate: 0.0095 },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', flag: '🇦🇪', rate: 0.044 },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', flag: '🇸🇬', rate: 0.016 },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', flag: '🇦🇺', rate: 0.018 },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', flag: '🇨🇦', rate: 0.016 },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen', flag: '🇯🇵', rate: 1.82 },
    { code: 'CNY', symbol: '¥', label: 'Chinese Yuan', flag: '🇨🇳', rate: 0.087 },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const PreferencesContext = createContext(null);

export const usePreferences = () => {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
    return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
            }
        } catch (_) { }
        return DEFAULT_PREFERENCES;
    });

    // Persist to localStorage whenever preferences change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (_) { }
    }, [preferences]);

    const updatePreferences = useCallback((updates) => {
        setPreferences(prev => ({ ...prev, ...updates }));
    }, []);

    // ── Currency helpers ──────────────────────────────────────────────────────
    const getCurrencyInfo = useCallback((code) => {
        return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
    }, []);

    /**
     * Convert an INR base amount to the currently selected currency.
     * All stored prices are assumed to be in INR.
     */
    const convertAmount = useCallback((amountInINR) => {
        const curr = getCurrencyInfo(preferences.currency);
        return amountInINR * curr.rate;
    }, [preferences.currency, getCurrencyInfo]);

    /**
     * Format a number as currency string in the selected currency.
     * @param {number} amountInINR - Raw amount in INR (base currency)
     * @param {{ compact?: boolean, decimals?: number }} [options]
     */
    const formatCurrency = useCallback((amountInINR, options = {}) => {
        if (amountInINR === null || amountInINR === undefined || amountInINR === '') return '—';
        const numValue = typeof amountInINR === 'string'
            ? parseFloat(amountInINR.replace(/[^0-9.-]/g, ''))
            : Number(amountInINR);
        if (isNaN(numValue)) return '—';

        const curr = getCurrencyInfo(preferences.currency);
        const converted = numValue * curr.rate;
        const { compact = false, decimals } = options;
        const dp = decimals !== undefined ? decimals : curr.code === 'JPY' ? 0 : 2;

        try {
            if (compact) {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: curr.code,
                    notation: 'compact',
                    maximumFractionDigits: 1,
                }).format(converted);
            }
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: curr.code,
                minimumFractionDigits: dp,
                maximumFractionDigits: dp,
            }).format(converted);
        } catch (_) {
            return `${curr.symbol}${converted.toFixed(dp)}`;
        }
    }, [preferences.currency, getCurrencyInfo]);

    /** Returns true if the selected currency is not INR (i.e. conversion is approximate) */
    const isApproximateConversion = preferences.currency !== 'INR';

    // ── Timezone helpers ──────────────────────────────────────────────────────
    /**
     * Format a Date (or ISO string) in the user's selected timezone.
     */
    const formatDateTime = useCallback((date, options = {}) => {
        const d = date instanceof Date ? date : new Date(date);
        const defaultOptions = {
            timeZone: preferences.timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options,
        };
        try {
            return new Intl.DateTimeFormat(undefined, defaultOptions).format(d);
        } catch (_) {
            return d.toLocaleString();
        }
    }, [preferences.timezone]);

    const formatDate = useCallback((date, options = {}) => {
        const d = date instanceof Date ? date : new Date(date);
        const defaultOptions = {
            timeZone: preferences.timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options,
        };
        try {
            return new Intl.DateTimeFormat(undefined, defaultOptions).format(d);
        } catch (_) {
            return d.toLocaleDateString();
        }
    }, [preferences.timezone]);

    const formatTime = useCallback((date, options = {}) => {
        const d = date instanceof Date ? date : new Date(date);
        const defaultOptions = {
            timeZone: preferences.timezone,
            hour: '2-digit',
            minute: '2-digit',
            ...options,
        };
        try {
            return new Intl.DateTimeFormat(undefined, defaultOptions).format(d);
        } catch (_) {
            return d.toLocaleTimeString();
        }
    }, [preferences.timezone]);

    // ── Language helpers ──────────────────────────────────────────────────────
    const getLanguageInfo = useCallback((code) => {
        return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
    }, []);

    const currentLanguage = getLanguageInfo(preferences.language);
    const currentCurrency = getCurrencyInfo(preferences.currency);
    const currentTimezone = SUPPORTED_TIMEZONES.find(t => t.value === preferences.timezone) || SUPPORTED_TIMEZONES[0];

    return (
        <PreferencesContext.Provider value={useMemo(() => ({
            preferences,
            updatePreferences,
            // Currency
            currentCurrency,
            formatCurrency,
            convertAmount,
            isApproximateConversion,
            getCurrencyInfo,
            // Timezone
            currentTimezone,
            formatDateTime,
            formatDate,
            formatTime,
            // Language
            currentLanguage,
            getLanguageInfo,
        }), [preferences, updatePreferences, currentCurrency, formatCurrency, convertAmount,
            getCurrencyInfo, currentTimezone, formatDateTime, formatDate, formatTime,
            currentLanguage, getLanguageInfo])}>
            {children}
        </PreferencesContext.Provider>
    );
};

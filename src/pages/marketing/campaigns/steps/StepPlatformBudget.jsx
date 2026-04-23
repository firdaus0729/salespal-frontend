import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    TrendingUp, AlertCircle, CheckCircle2,
    Sparkles, ArrowRight, Scale, RefreshCw, Check, Plus, X as XClose
} from 'lucide-react';
import { Facebook, Linkedin, Instagram, Twitter } from 'lucide-react';
import StepNavigation from '../components/StepNavigation';
import GeneratedCreativesPanel from '../components/GeneratedCreativesPanel';
import { usePreferences } from '../../../../context/PreferencesContext';

// ─── Brand Icons ─────────────────────────────────────────────────────────────

const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const YouTubeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="#FF0000" />
        <path d="M10 8l6 4-6 4V8z" fill="#FFFFFF" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// ─── Platform Registry ────────────────────────────────────────────────────────

const PLATFORM_REGISTRY = {
    meta: { id: 'meta', name: 'Meta Ads', subtext: 'Facebook & Instagram', Icon: Facebook, color: '#1877F2', bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', minBudget: 200 },
    google: { id: 'google', name: 'Google Ads', subtext: 'Search & Display', Icon: GoogleIcon, color: '#4285F4', bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-500', minBudget: 200 },
    linkedin: { id: 'linkedin', name: 'LinkedIn Ads', subtext: 'Professional Network', Icon: Linkedin, color: '#0A66C2', bg: 'bg-sky-50', text: 'text-sky-700', bar: 'bg-sky-600', minBudget: 500 },
    youtube: { id: 'youtube', name: 'YouTube Ads', subtext: 'Video Platform', Icon: YouTubeIcon, color: '#FF0000', bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500', minBudget: 300 },
    twitter: { id: 'twitter', name: 'X / Twitter', subtext: 'Social Media', Icon: XIcon, color: '#000000', bg: 'bg-gray-100', text: 'text-gray-800', bar: 'bg-gray-700', minBudget: 200 },
    instagram: { id: 'instagram', name: 'Instagram', subtext: 'Visual Stories', Icon: Instagram, color: '#E1306C', bg: 'bg-pink-50', text: 'text-pink-600', bar: 'bg-pink-500', minBudget: 200 },
};

// AI-suggested split weights per platform (normalized to 100%)
const AI_WEIGHTS = {
    meta: 35,
    google: 30,
    linkedin: 15,
    youtube: 10,
    twitter: 5,
    instagram: 5,
};

// ─── Minimum budget guidance per platform ─────────────────────────────────────
const MIN_DAILY_PER_PLATFORM = {
    meta: 200,
    google: 200,
    linkedin: 500,
    youtube: 300,
    twitter: 200,
    instagram: 200,
};

// ─── Ordered list of ALL possible platforms (for the picker grid) ─────────────
const ALL_PLATFORMS_LIST = [
    { id: 'meta', recommended: true },
    { id: 'google', recommended: true },
    { id: 'linkedin', recommended: false },
    { id: 'youtube', recommended: false },
    { id: 'twitter', recommended: false },
    { id: 'instagram', recommended: false },
];

// ─── Helper: compute AI-suggested split amounts ──────────────────────────────
function computeAISplit(platformIds, total) {
    const totalWeight = platformIds.reduce((s, id) => s + (AI_WEIGHTS[id] || 10), 0);
    const result = {};
    platformIds.forEach(id => {
        const weight = AI_WEIGHTS[id] || 10;
        result[id] = Math.round((weight / totalWeight) * total);
    });
    // Correct rounding error
    const sum = Object.values(result).reduce((s, v) => s + v, 0);
    const diff = total - sum;
    if (platformIds.length > 0) result[platformIds[0]] += diff;
    return result;
}

// ─── Helper: equal split ────────────────────────────────────────────────────
function computeEqualSplit(platformIds, total) {
    if (platformIds.length === 0) return {};
    const base = Math.floor(total / platformIds.length);
    const result = {};
    platformIds.forEach(id => (result[id] = base));
    const rem = total - base * platformIds.length;
    if (platformIds.length > 0) result[platformIds[0]] += rem;
    return result;
}

// ─── Pill component for overview bar segments ────────────────────────────────
const BarSegment = ({ platform, pct, amount, symbol }) => {
    const meta = PLATFORM_REGISTRY[platform.id] || {};
    return (
        <div
            className={`h-full ${meta.bar} first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group`}
            style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
            title={`${platform.name}: ${symbol}${amount} (${pct}%)`}
        />
    );
};

// ─── Per-platform budget row ──────────────────────────────────────────────────
const PlatformBudgetRow = ({ platform, value, totalBudget, onChange, error, symbol }) => {
    const meta = PLATFORM_REGISTRY[platform.id] || {};
    const Icon = meta.Icon || (() => null);
    const pct = totalBudget > 0 ? Math.round((value / totalBudget) * 100) : 0;
    const minBudget = MIN_DAILY_PER_PLATFORM[platform.id] || 100;

    return (
        <div className={`rounded-xl border transition-all duration-200 ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    {/* Platform icon */}
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${meta.text}`}>{platform.name}</p>
                        <p className="text-[11px] text-gray-400">{platform.subtext || meta.subtext}</p>
                    </div>
                    {/* Percentage badge */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                        {pct}%
                    </span>
                </div>

                {/* Budget input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">{symbol}</span>
                    </div>
                    <input
                        type="number"
                        min={minBudget}
                        step="50"
                        value={value}
                        onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
                        className={`w-full pl-8 pr-16 py-2.5 text-base font-bold text-gray-900 bg-transparent border rounded-lg focus:outline-none focus:ring-2 transition-all ${error
                            ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
                            }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xs font-medium">/ day</span>
                    </div>
                </div>

                {/* Allocation bar */}
                <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${meta.bar} rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                    />
                </div>

                {/* Error / info */}
                {error && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Minimum {symbol}{minBudget}/day for {platform.name}
                    </p>
                )}
                {!error && (
                    <p className="mt-1.5 text-[10px] text-gray-400">
                        Min {symbol}{minBudget}/day · Est. {symbol}{Math.round(value * 30).toLocaleString()}/month
                    </p>
                )}
            </div>
        </div>
    );
};


// ─── Main Component ───────────────────────────────────────────────────────────

const StepPlatformBudget = ({ onComplete, onUpdate, onBack, data }) => {
    const { formatCurrency, currentCurrency } = usePreferences();
    const symbol = currentCurrency?.symbol || '₹';

    // ── Seed initial platform selection (priority: saved budget > ad-step > default) ──
    const seedPlatformIds = useMemo(() => {
        if (data?.budget?.platforms?.length > 0) return data.budget.platforms;
        if (data?.adSettings?.platforms?.length > 0) return data.adSettings.platforms;
        return ['meta', 'google'];
    }, []); // run once on mount

    // Platform selection is now LOCAL state — user can toggle here too
    const [selectedPlatformIds, setSelectedPlatformIds] = useState(seedPlatformIds);

    const selectedPlatforms = useMemo(
        () => selectedPlatformIds.map(id => PLATFORM_REGISTRY[id]).filter(Boolean),
        [selectedPlatformIds]
    );

    // Initialize per-platform budgets (preserve amounts across toggle on/off)
    const [platformBudgets, setPlatformBudgets] = useState(() => {
        if (data?.budget?.perPlatform) return data.budget.perPlatform;
        const defaultTotal = 3500;
        return computeEqualSplit(seedPlatformIds, defaultTotal);
    });

    // Initialize total campaign budget
    const [totalCampaignBudget, setTotalCampaignBudget] = useState(() => {
        if (data?.budget?.daily) return data.budget.daily;
        if (data?.budget?.perPlatform) {
            return Object.values(data.budget.perPlatform).reduce((s, v) => s + (v || 0), 0);
        }
        return 3500;
    });

    // ── Toggle a platform on / off ────────────────────────────────────────────
    const togglePlatform = useCallback((id) => {
        setSelectedPlatformIds(prev => {
            const isActive = prev.includes(id);
            if (isActive) {
                // Must keep at least 1
                if (prev.length <= 1) return prev;
                return prev.filter(p => p !== id);
            }
            // Add — seed budget if not yet set
            setPlatformBudgets(b => ({
                ...b,
                [id]: b[id] ?? (MIN_DAILY_PER_PLATFORM[id] || 200),
            }));
            return [...prev, id];
        });
    }, []);

    // Computed totals
    const allocatedBudget = useMemo(
        () => Object.values(platformBudgets).reduce((s, v) => s + (v || 0), 0),
        [platformBudgets]
    );
    const monthlyBudget = totalCampaignBudget * 30;
    const remainingBudget = totalCampaignBudget - allocatedBudget;
    const isBudgetMismatch = selectedPlatformIds.length > 0 && remainingBudget !== 0;

    // Validation errors per platform
    const [showErrors, setShowErrors] = useState(false);
    const errors = useMemo(() => {
        const errs = {};
        selectedPlatformIds.forEach(id => {
            const min = MIN_DAILY_PER_PLATFORM[id] || 100;
            if (!platformBudgets[id] || platformBudgets[id] < min) {
                errs[id] = true;
            }
        });
        return errs;
    }, [platformBudgets, selectedPlatformIds]);

    const hasErrors = Object.keys(errors).length > 0 || isBudgetMismatch || totalCampaignBudget <= 0;

    useEffect(() => {
        if (onUpdate) {
            const split = {};
            const activeBudgets = {};
            selectedPlatformIds.forEach(id => {
                activeBudgets[id] = platformBudgets[id] || 0;
                split[id] = totalCampaignBudget > 0 ? Math.round((platformBudgets[id] / totalCampaignBudget) * 100) : 0;
            });

            onUpdate({
                budget: {
                    daily: totalCampaignBudget,
                    monthly: totalCampaignBudget * 30,
                    currency: currentCurrency?.code || 'INR',
                    perPlatform: activeBudgets,
                    split,
                    platforms: selectedPlatformIds,
                    legacyMeta: platformBudgets['meta'] || 0,
                    legacyGoogle: platformBudgets['google'] || 0,
                },
                platforms: selectedPlatformIds,
            });
        }
    }, [totalCampaignBudget, platformBudgets, selectedPlatformIds, currentCurrency, onUpdate]);

    // Handlers
    const handleBudgetChange = useCallback((platformId, value) => {
        setPlatformBudgets(prev => ({ ...prev, [platformId]: Math.max(0, value) }));
    }, []);

    const handleEqualSplit = useCallback(() => {
        const base = totalCampaignBudget > 0 ? totalCampaignBudget : selectedPlatformIds.length * 500;
        // Only touch selected platforms; leave un-selected stashed amounts untouched
        const split = computeEqualSplit(selectedPlatformIds, base);
        setPlatformBudgets(prev => ({ ...prev, ...split }));
    }, [totalCampaignBudget, selectedPlatformIds]);

    const handleAISplit = useCallback(() => {
        const base = totalCampaignBudget > 0 ? totalCampaignBudget : 3500;
        const split = computeAISplit(selectedPlatformIds, base);
        setPlatformBudgets(prev => ({ ...prev, ...split }));
    }, [totalCampaignBudget, selectedPlatformIds]);

    const handleNext = () => {
        if (selectedPlatformIds.length === 0) {
            setShowErrors(true);
            return;
        }
        setShowErrors(true);
        if (hasErrors) return;

        // Build per-platform split percentages
        const split = {};
        // Only export budgets for SELECTED platforms
        const activeBudgets = {};
        selectedPlatformIds.forEach(id => {
            activeBudgets[id] = platformBudgets[id] || 0;
            split[id] = totalCampaignBudget > 0 ? Math.round((platformBudgets[id] / totalCampaignBudget) * 100) : 0;
        });

        onComplete({
            budget: {
                daily: totalCampaignBudget,
                monthly: monthlyBudget,
                currency: currentCurrency?.code || 'INR',
                perPlatform: activeBudgets,
                split,
                platforms: selectedPlatformIds,
                legacyMeta: platformBudgets['meta'] || 0,
                legacyGoogle: platformBudgets['google'] || 0,
            },
            platforms: selectedPlatformIds,
        });
    };

    // Bar segments data
    const barSegments = useMemo(() => {
        return selectedPlatformIds.map(id => {
            const meta = PLATFORM_REGISTRY[id];
            const amount = platformBudgets[id] || 0;
            const pct = totalCampaignBudget > 0 ? Math.round((amount / totalCampaignBudget) * 100) : 0;
            return { ...meta, amount, pct };
        });
    }, [selectedPlatformIds, platformBudgets, totalCampaignBudget]);

    // Estimated reach (rough heuristics)
    const estimatedImpressions = useMemo(() => {
        const base = totalCampaignBudget * 3.5; // rough CPM factor
        return { low: Math.round(base * 0.8), high: Math.round(base * 1.2) };
    }, [totalCampaignBudget]);

    const estimatedLeads = useMemo(() => {
        const base = totalCampaignBudget / 60;
        return { low: Math.round(base * 0.8), high: Math.round(base * 1.2) };
    }, [totalCampaignBudget]);

    const totalExceedWarning = totalCampaignBudget > 50000; // warn if > 50k/day

    return (
        <div className="animate-fade-in-up">
            <div className="grid lg:grid-cols-2 gap-10">

                {/* ── LEFT COLUMN: Controls ───────────────────────────────────── */}
                <div className="space-y-8">

                    {/* ── PLATFORM PICKER CARD ────────────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Advertising Platforms</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Select the platforms you want to run ads on</p>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedPlatformIds.length === 0
                                ? 'bg-red-50 text-red-600'
                                : 'bg-blue-50 text-blue-700'
                                }`}>
                                {selectedPlatformIds.length} selected
                            </span>
                        </div>

                        <div className="p-4 grid grid-cols-3 gap-2">
                            {ALL_PLATFORMS_LIST.map(({ id, recommended }) => {
                                const meta = PLATFORM_REGISTRY[id];
                                if (!meta) return null;
                                const Icon = meta.Icon;
                                const isSelected = selectedPlatformIds.includes(id);
                                const isLast = selectedPlatformIds.length === 1 && isSelected;

                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => togglePlatform(id)}
                                        disabled={isLast}
                                        title={isLast ? 'At least one platform must be selected' : isSelected ? `Remove ${meta.name}` : `Add ${meta.name}`}
                                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 group ${isSelected
                                            ? `${meta.bg} border-current ${meta.text} shadow-sm`
                                            : isLast
                                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-gray-500'
                                            }`}
                                    >
                                        {/* Checkmark badge */}
                                        {isSelected && (
                                            <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${meta.bar}`}>
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                            </span>
                                        )}

                                        {/* Add badge for unselected */}
                                        {!isSelected && !isLast && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-gray-200 group-hover:bg-blue-500 transition-colors">
                                                <Plus className="w-2.5 h-2.5 text-gray-500 group-hover:text-white" strokeWidth={3} />
                                            </span>
                                        )}

                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/70' : 'bg-gray-100'
                                            }`}>
                                            <Icon className="w-4 h-4" />
                                        </div>

                                        <span className={`text-[11px] font-semibold leading-tight text-center ${isSelected ? meta.text : 'text-gray-700'
                                            }`}>
                                            {meta.name.replace(' Ads', '').replace(' /', '')}
                                        </span>

                                        {recommended && (
                                            <span className="text-[9px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-1 py-0.5 rounded">
                                                ★ Rec
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Validation hint */}
                        {showErrors && selectedPlatformIds.length === 0 && (
                            <div className="px-4 pb-3">
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Please select at least one platform to continue.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── TOTAL CAMPAIGN BUDGET INPUT ────────────────────────── */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Total Campaign Budget</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium">{symbol}</span>
                            </div>
                            <input
                                type="number"
                                min={0}
                                step="100"
                                value={totalCampaignBudget || ''}
                                onChange={e => {
                                    const val = parseInt(e.target.value, 10);
                                    setTotalCampaignBudget(isNaN(val) ? 0 : val);
                                }}
                                placeholder="Enter total amount you plan to spend"
                                className={`w-full pl-8 pr-16 py-3 text-lg font-bold text-gray-900 bg-transparent border rounded-xl focus:outline-none focus:ring-2 transition-all ${showErrors && totalCampaignBudget <= 0 ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm font-medium">/ day</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Budget</p>
                                <p className="text-sm font-bold text-gray-900">{symbol}{totalCampaignBudget.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Allocated</p>
                                <p className="text-sm font-bold text-blue-600">{symbol}{allocatedBudget.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-xs mb-1 ${remainingBudget < 0 ? 'text-red-500' : 'text-gray-500'}`}>Remaining</p>
                                <p className={`text-sm font-bold ${remainingBudget === 0 ? 'text-green-600' : remainingBudget < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                                    {remainingBudget > 0 ? '+' : ''}{symbol}{remainingBudget.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {remainingBudget < 0 ? (
                            <p className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" />
                                Allocated amount exceeds your total budget.
                            </p>
                        ) : remainingBudget > 0 && allocatedBudget > 0 ? (
                            <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" />
                                You have {symbol}{remainingBudget.toLocaleString()} unallocated budget.
                            </p>
                        ) : null}
                    </div>

                    {/* Smart split action bar */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">
                            Budget Allocation
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                        <button
                            type="button"
                            onClick={handleAISplit}
                            disabled={selectedPlatformIds.length === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-40"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Suggest
                        </button>
                        <button
                            type="button"
                            onClick={handleEqualSplit}
                            disabled={selectedPlatformIds.length === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                            <Scale className="w-3.5 h-3.5" />
                            Equal Split
                        </button>
                    </div>

                    {/* Per-platform budget inputs */}
                    <div className="space-y-3">
                        {selectedPlatforms.map(platform => (
                            <PlatformBudgetRow
                                key={platform.id}
                                platform={platform}
                                value={platformBudgets[platform.id] || 0}
                                totalBudget={totalCampaignBudget}
                                onChange={val => handleBudgetChange(platform.id, val)}
                                error={showErrors && errors[platform.id]}
                                symbol={symbol}
                            />
                        ))}

                        {selectedPlatforms.length === 0 && (
                            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                                <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Select at least one platform above to set a budget.</p>
                            </div>
                        )}
                    </div>

                    {/* Total budget row */}
                    {selectedPlatforms.length > 0 && (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Total Budget Breakdown</h3>

                            {/* Segmented bar */}
                            <div className="flex h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4 gap-0.5">
                                {barSegments.map(seg => (
                                    <div
                                        key={seg.id}
                                        className={`h-full ${seg.bar} transition-all duration-300`}
                                        style={{ width: `${seg.pct}%`, minWidth: seg.pct > 0 ? '4px' : '0' }}
                                        title={`${seg.name}: ${seg.pct}%`}
                                    />
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                                {barSegments.map(seg => (
                                    <span key={seg.id} className="text-[11px] text-gray-600 flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${seg.bar} inline-block`} />
                                        {seg.name} — {seg.pct}%
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Total Daily Budget</p>
                                    <p className="text-3xl font-extrabold text-gray-900 leading-none">{symbol}{totalCampaignBudget.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Monthly Estimate</p>
                                    <p className="text-lg font-bold text-gray-600">{symbol}{monthlyBudget.toLocaleString()}</p>
                                </div>
                            </div>

                            {totalExceedWarning && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    High daily spend — make sure your account is ready for this volume.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Validation summary */}
                    {showErrors && hasErrors && (
                        <div className="flex flex-col gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            {Object.keys(errors).length > 0 && (
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Please fix the minimum platform budget errors.</span>
                                </div>
                            )}
                            {isBudgetMismatch && (
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Your allocated amount must exactly match your Total Campaign Budget.</span>
                                </div>
                            )}
                            {totalCampaignBudget <= 0 && (
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Please enter a valid Total Campaign Budget.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: Summary card ─────────────────────────────── */}
                <div className="lg:pl-8 lg:border-l border-gray-100">
                    <div className="sticky top-6 space-y-5">
                        {data?.adSettings?.chosenCampaign && (
                            <GeneratedCreativesPanel
                                chosenCampaign={data.adSettings.chosenCampaign}
                                selectedAdFormat={data.adSettings.selectedAdFormat || 'image'}
                                videoDurationSec={data.adSettings.videoDurationSec || 12}
                            />
                        )}

                        {/* Estimated reach card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Estimated Reach
                            </h3>

                            <div className="space-y-4">
                                {/* Daily spend */}
                                <div className="flex justify-between items-baseline pb-4 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Total Campaign Budget</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(totalCampaignBudget)}</span>
                                </div>

                                {/* Per-platform breakdown */}
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-3">Per-Platform Allocation</p>
                                    <div className="space-y-2">
                                        {barSegments.map(seg => {
                                            const Icon = seg.Icon || (() => null);
                                            return (
                                                <div key={seg.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${seg.bg}`}>
                                                            <Icon className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-xs text-gray-700">{seg.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-gray-900">{formatCurrency(seg.amount)}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${seg.bg} ${seg.text}`}>{seg.pct}%</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Monthly estimate */}
                                <div className="flex justify-between items-baseline pb-4 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Monthly Estimate</span>
                                    <span className="text-xl font-bold text-gray-500">{formatCurrency(monthlyBudget)}</span>
                                </div>

                                {/* Reach estimates */}
                                <div>
                                    <p className="text-xs text-center text-gray-400 uppercase tracking-widest font-medium mb-3">Est. Results Per Month</p>
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="text-lg font-bold text-gray-900">
                                                {estimatedImpressions.low.toLocaleString()} – {estimatedImpressions.high.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">Impressions</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <div className="text-lg font-bold text-gray-900">
                                                {estimatedLeads.low} – {estimatedLeads.high}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">Leads</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                                        <p>Estimates based on historical data & AI benchmarks. Actual results may vary.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI insight tip */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3">
                            <div className="bg-white p-2 rounded-full h-fit shadow-sm text-xl shrink-0">💡</div>
                            <div className="text-sm text-purple-900 leading-relaxed">
                                <strong>AI Tip:</strong>{' '}
                                {selectedPlatformIds.includes('meta') && selectedPlatformIds.includes('google')
                                    ? 'Allocating more to Meta drives top-of-funnel reach while Google captures high-intent searches. A 55/45 split is often optimal.'
                                    : selectedPlatformIds.includes('linkedin')
                                        ? 'LinkedIn requires a higher minimum to be effective. Ensure you allocate at least ₹500/day for meaningful reach.'
                                        : `SalesPal AI will continuously optimize spend across your ${selectedPlatformIds.length} selected platform${selectedPlatformIds.length > 1 ? 's' : ''} to maximize results.`
                                }
                            </div>
                        </div>

                        {/* Quick adjustments */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Adjustments</p>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={handleAISplit}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-colors"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-purple-700">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Apply AI-recommended split
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEqualSplit}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Scale className="w-3.5 h-3.5" />
                                        Distribute budget equally
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPlatformBudgets(prev => {
                                            const doubled = {};
                                            Object.entries(prev).forEach(([k, v]) => (doubled[k] = v * 2));
                                            return doubled;
                                        });
                                        setTotalCampaignBudget(prev => prev * 2);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Double all budgets
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Notes on min budgets */}
                        <div className="text-[11px] text-gray-400 space-y-1">
                            {selectedPlatforms.map(p => (
                                <div key={p.id} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    <span>{p.name}: min {symbol}{MIN_DAILY_PER_PLATFORM[p.id]}/day</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Nav */}
            <div className="pt-8 mt-8 border-t border-gray-100">
                <StepNavigation
                    onNext={handleNext}
                    onBack={onBack}
                    nextLabel="Continue to Review"
                />
            </div>
        </div>
    );
};

export default StepPlatformBudget;

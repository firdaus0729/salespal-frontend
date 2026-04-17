import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShoppingCart, Image as ImageIcon, Video, Lock,
    ArrowRight, Sparkles, Phone, MessageSquare, Radio,
    MessageCircle, Layers, Zap, Plus, Minus, AlertTriangle,
    CheckCircle2, TrendingUp
} from 'lucide-react';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { useCart } from '../../commerce/CartContext';
import { usePreferences } from '../../context/PreferencesContext';
import Button from '../ui/Button';

// ─── Usage tier helper ─────────────────────────────────────────────────────────
const getTier = (remaining, total) => {
    if (!total) return 'none';
    const pct = (remaining / total) * 100;
    if (pct <= 10) return 'critical';
    if (pct <= 25) return 'high';
    if (pct <= 50) return 'medium';
    return 'good';
};

const TIER_CONFIG = {
    good: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Healthy', dot: 'bg-emerald-400' },
    medium: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: '50% left', dot: 'bg-amber-400' },
    high: { bar: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Running low', dot: 'bg-orange-500' },
    critical: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Critical', dot: 'bg-red-500 animate-pulse' },
    none: { bar: 'bg-gray-300', badge: 'bg-gray-50 text-gray-500 border-gray-200', label: '—', dot: 'bg-gray-300' },
};

// ─── Credit type definitions ───────────────────────────────────────────────────
const LEFT_CREDITS = [
    {
        id: 'images',
        label: 'Image Credits',
        sublabel: 'AI-generated photos',
        Icon: ImageIcon,
        color: 'text-blue-600',
        iconBg: 'bg-blue-50',
        packId: 'marketing-images-25',
        packName: '25 Image Credits',
        resource: 'images',
        amount: 25,
        price: 999,
        popular: true,
    },
    {
        id: 'videos',
        label: 'Video Credits',
        sublabel: 'Marketing video creation',
        Icon: Video,
        color: 'text-purple-600',
        iconBg: 'bg-purple-50',
        packId: 'marketing-videos-5',
        packName: '5 Video Credits',
        resource: 'videos',
        amount: 5,
        price: 799,
    },
    {
        id: 'calls',
        label: 'Call Credits',
        sublabel: 'Outbound voice calls',
        Icon: Phone,
        color: 'text-green-600',
        iconBg: 'bg-green-50',
        packId: 'marketing-calls-500',
        packName: '500 Call Credits',
        resource: 'calls',
        amount: 500,
        price: 699,
    },
];

const RIGHT_CREDITS = [
    {
        id: 'sms',
        label: 'SMS Credits',
        sublabel: 'Promotional SMS messages',
        Icon: MessageSquare,
        color: 'text-sky-600',
        iconBg: 'bg-sky-50',
        packId: 'marketing-sms-1000',
        packName: '1,000 SMS Credits',
        resource: 'sms',
        amount: 1000,
        price: 399,
    },
    {
        id: 'rcs',
        label: 'RCS Credits',
        sublabel: 'Rich Communication Services',
        Icon: Radio,
        color: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
        packId: 'marketing-rcs-500',
        packName: '500 RCS Credits',
        resource: 'rcs',
        amount: 500,
        price: 599,
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp Credits',
        sublabel: 'Business messaging',
        Icon: MessageCircle,
        color: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
        packId: 'marketing-wa-300',
        packName: '300 WA Credits',
        resource: 'whatsapp',
        amount: 300,
        price: 449,
        popular: true,
    },
];

// ─── Usage Progress Bar ────────────────────────────────────────────────────────
const UsageBar = ({ remaining, total }) => {
    const tier = getTier(remaining, total);
    const cfg = TIER_CONFIG[tier];
    const usedPct = total > 0 ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">{usedPct}% used</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                    style={{ width: `${usedPct}%` }}
                />
            </div>
        </div>
    );
};

// ─── Credit Tile ───────────────────────────────────────────────────────────────
const CreditTile = ({ def, remaining, total, qty, onIncrement, onDecrement, formatCurrency }) => {
    const tier = getTier(remaining, total);
    const isSelected = qty > 0;
    const isCritical = tier === 'critical' || tier === 'high';
    const Icon = def.Icon;

    return (
        <div className={`relative rounded-xl border p-3 transition-all duration-200 ${isSelected
            ? 'border-blue-400 bg-blue-50/40 shadow-sm ring-1 ring-blue-100'
            : isCritical
                ? 'border-orange-200 bg-orange-50/20 hover:border-orange-300'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}>
            {/* Popular badge */}
            {def.popular && (
                <span className="absolute -top-2 right-3 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide z-10">
                    Popular
                </span>
            )}

            {/* Low credit warning */}
            {isCritical && !isSelected && (
                <span className="absolute -top-2 left-3 bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-0.5">
                    <AlertTriangle className="w-2 h-2" />
                    Low
                </span>
            )}

            {/* Header row */}
            <div className="flex items-start gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${def.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${def.color}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">{def.label}</p>
                    <p className="text-[9px] text-gray-400 leading-tight truncate">{def.sublabel}</p>
                </div>
            </div>

            {/* Credits remaining */}
            <div className="flex items-baseline gap-1 mb-1.5">
                <span className={`text-xl font-black leading-none ${tier === 'critical' ? 'text-red-600' :
                    tier === 'high' ? 'text-orange-600' :
                        tier === 'medium' ? 'text-amber-600' : 'text-gray-900'
                    }`}>{remaining}</span>
                <span className="text-[10px] text-gray-400">/ {total}</span>
            </div>

            {/* Usage bar */}
            <UsageBar remaining={remaining} total={total} />

            {/* Pack price */}
            <div className="flex items-center justify-between mt-2 mb-1.5">
                <span className="text-[10px] text-gray-500">{def.packName}</span>
                <span className="text-xs font-bold text-gray-800">{formatCurrency(def.price)}</span>
            </div>

            {/* CTA */}
            {qty === 0 ? (
                <button
                    onClick={onIncrement}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isCritical
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                >
                    <Plus className="w-3 h-3" strokeWidth={3} />
                    Top Up
                </button>
            ) : (
                <div className="flex items-center justify-between bg-blue-600 rounded-lg p-1">
                    <button
                        onClick={onDecrement}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                    >
                        <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>
                    <span className="text-white font-bold text-sm">{qty}</span>
                    <button
                        onClick={onIncrement}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-400 text-white transition-colors"
                    >
                        <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Column Header ─────────────────────────────────────────────────────────────
const ColumnHeader = ({ label, icon: Icon }) => (
    <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-gray-100">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
);

// ─── Balance Strip (top of drawer) ───────────────────────────────────────────
const ALL_CREDIT_DEFS = [
    { id: 'images', label: 'Images', Icon: ImageIcon, color: 'text-blue-600', dotColor: 'bg-blue-500' },
    { id: 'videos', label: 'Videos', Icon: Video, color: 'text-purple-600', dotColor: 'bg-purple-500' },
    { id: 'calls', label: 'Calls', Icon: Phone, color: 'text-green-600', dotColor: 'bg-green-500' },
    { id: 'sms', label: 'SMS', Icon: MessageSquare, color: 'text-sky-600', dotColor: 'bg-sky-500' },
    { id: 'rcs', label: 'RCS', Icon: Radio, color: 'text-indigo-600', dotColor: 'bg-indigo-500' },
    { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, color: 'text-emerald-600', dotColor: 'bg-emerald-500' },
];

const BalanceStrip = ({ balances }) => (
    <div className="flex-none border-b border-gray-100 bg-gray-50 px-5 py-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Balance</p>
        <div className="grid grid-cols-4 gap-2">
            {ALL_CREDIT_DEFS.map(({ id, label, Icon, color, dotColor }) => {
                const { remaining = 0, total = 1 } = balances[id] || {};
                const tier = getTier(remaining, total);
                const cfg = TIER_CONFIG[tier];
                const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
                const isBad = tier === 'critical' || tier === 'high';
                return (
                    <div
                        key={id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all ${isBad ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                            }`}
                    >
                        {/* Icon */}
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} strokeWidth={2} />

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-semibold text-gray-500 leading-none mb-0.5 truncate">{label}</p>
                            <div className="flex items-baseline gap-0.5 leading-none">
                                <span className={`text-sm font-black ${tier === 'critical' ? 'text-red-600' :
                                    tier === 'high' ? 'text-orange-600' :
                                        tier === 'medium' ? 'text-amber-600' : 'text-gray-900'
                                    }`}>{remaining.toLocaleString()}</span>
                                <span className="text-[9px] text-gray-400">/{total.toLocaleString()}</span>
                            </div>
                            {/* Mini bar */}
                            <div className="mt-1 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${cfg.bar}`}
                                    style={{ width: `${Math.min(100, Math.round(((total - remaining) / total) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const TopUpDrawer = ({ isOpen, onClose }) => {
    const { isModuleActive } = useSubscription();
    const { addProductToCart } = useCart();
    const navigate = useNavigate();
    const { formatCurrency } = usePreferences();

    // Per-pack selected quantity
    const [selectedPacks, setSelectedPacks] = useState({});

    const isMarketingActive = isModuleActive('marketing');

    // Credit balances — will be wired to real Supabase data in Phase 3+
    // For now, uses plan-based defaults. creditState.baseLimits not yet populated by backend.
    const creditBalances = useMemo(() => ({
        images: { remaining: 20, total: 20 },
        videos: { remaining: 4, total: 4 },
        calls: { remaining: 50, total: 500 },
        sms: { remaining: 800, total: 1000 },
        rcs: { remaining: 120, total: 500 },
        whatsapp: { remaining: 180, total: 300 },
    }), []);

    const handleIncrement = (packId) => setSelectedPacks(prev => ({ ...prev, [packId]: (prev[packId] || 0) + 1 }));
    const handleDecrement = (packId) => setSelectedPacks(prev => {
        const current = prev[packId] || 0;
        if (current <= 1) { const { [packId]: _, ...rest } = prev; return rest; }
        return { ...prev, [packId]: current - 1 };
    });

    const allPacks = [...LEFT_CREDITS, ...RIGHT_CREDITS];
    const totalItems = Object.values(selectedPacks).reduce((s, q) => s + q, 0);
    const totalPrice = Object.entries(selectedPacks).reduce((s, [id, qty]) => {
        const pack = allPacks.find(p => p.packId === id);
        return s + (pack ? pack.price * qty : 0);
    }, 0);
    const totalCreditsAdded = Object.entries(selectedPacks).reduce((s, [id, qty]) => {
        const pack = allPacks.find(p => p.packId === id);
        return s + (pack ? pack.amount * qty : 0);
    }, 0);

    const handleCheckout = () => {
        Object.entries(selectedPacks).forEach(([packId, qty]) => {
            const pack = allPacks.find(p => p.packId === packId);
            if (!pack) return;
            addProductToCart({
                id: pack.packId,
                name: pack.packName,
                type: 'credits',
                module: 'marketing',
                creditType: pack.resource,
                quantity: pack.amount,
                price: pack.price,
                cartQuantity: qty,
            });
        });
        onClose();
        navigate('/cart');
    };

    // Count low credits for the summary banner
    const lowCreditCount = Object.entries(creditBalances).filter(([, { remaining, total }]) => {
        const tier = getTier(remaining, total);
        return tier === 'critical' || tier === 'high';
    }).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer — wider to accommodate 2 columns */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col"
                        style={{ width: 'min(700px, 100vw)' }}
                    >
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-none bg-white">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Top Up Credits</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Add credits to keep your campaigns running</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {totalItems > 0 && (
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        {totalItems} in cart
                                    </span>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* ── Balance Strip — always visible ── */}
                        <BalanceStrip balances={creditBalances} />

                        {/* ── Content ── */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide pb-28">
                            {!isMarketingActive ? (
                                /* Locked state */
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Lock className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Activate Plan First</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        You need an active Marketing subscription to purchase and use credits.
                                    </p>
                                    <Button onClick={() => { onClose(); window.location.href = '/#pricing'; }}>
                                        View Plans <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-5 space-y-5">

                                    {/* ── Summary banner ── */}
                                    {lowCreditCount > 0 ? (
                                        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-orange-800">
                                                    {lowCreditCount} credit type{lowCreditCount > 1 ? 's are' : ' is'} running low
                                                </p>
                                                <p className="text-xs text-orange-600">Top up now to avoid campaign interruptions.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <p className="text-sm font-semibold text-emerald-800">All credits look healthy — but you can always top up!</p>
                                        </div>
                                    )}

                                    {/* ── Two-column credit grid ── */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Left Column */}
                                        <div>
                                            <ColumnHeader label="Creative & Engagement" icon={TrendingUp} />
                                            <div className="space-y-3">
                                                {LEFT_CREDITS.map(def => (
                                                    <CreditTile
                                                        key={def.id}
                                                        def={def}
                                                        remaining={creditBalances[def.id]?.remaining ?? 0}
                                                        total={creditBalances[def.id]?.total ?? 1}
                                                        qty={selectedPacks[def.packId] || 0}
                                                        onIncrement={() => handleIncrement(def.packId)}
                                                        onDecrement={() => handleDecrement(def.packId)}
                                                        formatCurrency={formatCurrency}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div>
                                            <ColumnHeader label="Communication Channels" icon={MessageSquare} />
                                            <div className="space-y-3">
                                                {RIGHT_CREDITS.map(def => (
                                                    <CreditTile
                                                        key={def.id}
                                                        def={def}
                                                        remaining={creditBalances[def.id]?.remaining ?? 0}
                                                        total={creditBalances[def.id]?.total ?? 1}
                                                        qty={selectedPacks[def.packId] || 0}
                                                        onIncrement={() => handleIncrement(def.packId)}
                                                        onDecrement={() => handleDecrement(def.packId)}
                                                        formatCurrency={formatCurrency}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Sticky Checkout Bar ── */}
                        <div className="bg-white border-t border-gray-100 px-5 py-4 flex-none z-20">
                            {totalItems > 0 ? (
                                <motion.div
                                    initial={{ y: 16, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-gray-900 text-white rounded-xl px-5 py-3.5 flex items-center justify-between shadow-lg"
                                >
                                    <div>
                                        <div className="text-xs text-gray-400 mb-0.5">
                                            {totalItems} pack{totalItems > 1 ? 's' : ''} · +{totalCreditsAdded.toLocaleString()} credits
                                        </div>
                                        <div className="text-xl font-black leading-none">{formatCurrency(totalPrice)}</div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Checkout
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        Secure payment · Instant credit top-up
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TopUpDrawer;

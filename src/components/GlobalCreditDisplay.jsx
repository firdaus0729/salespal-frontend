import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Image, Video, Phone, MessageSquare,
    AlertTriangle, Zap, Plus, Sparkles,
    Radio, MessageCircle, Layers
} from 'lucide-react';
import { useSubscription } from '../commerce/SubscriptionContext';

// ─── Warning tier ──────────────────────────────────────────────────────────────
const getWarningTier = (used, total) => {
    if (!total) return 'none';
    const pct = (used / total) * 100;
    if (pct >= 95) return 'critical';
    if (pct >= 85) return 'high';
    if (pct >= 70) return 'medium';
    return 'none';
};

const TIER_STYLES = {
    none: { numColor: 'text-gray-900', labelColor: 'text-gray-400', bg: '', border: '', barColor: 'bg-blue-500' },
    medium: { numColor: 'text-amber-600', labelColor: 'text-amber-500', bg: 'bg-amber-50', border: 'ring-1 ring-amber-200', barColor: 'bg-amber-400' },
    high: { numColor: 'text-orange-600', labelColor: 'text-orange-500', bg: 'bg-orange-50', border: 'ring-1 ring-orange-300', barColor: 'bg-orange-500' },
    critical: { numColor: 'text-red-600', labelColor: 'text-red-500', bg: 'bg-red-50', border: 'ring-1 ring-red-300', barColor: 'bg-red-500' },
};

// ─── Single pill ───────────────────────────────────────────────────────────────
const CreditPill = ({ icon: Icon, label, remaining, total, onClick }) => {
    const used = total - remaining;
    const tier = getWarningTier(used, total);
    const styles = TIER_STYLES[tier];
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex flex-col items-center px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer select-none hover:bg-gray-50 ${styles.bg} ${styles.border}`}
            title={`${label}: ${remaining} / ${total}`}
        >
            {/* Icon + counts */}
            <div className="flex items-center gap-1 leading-none">
                <Icon className={`w-3 h-3 shrink-0 ${tier === 'none' ? 'text-gray-400' : styles.labelColor}`} strokeWidth={2} />
                <span className={`text-xs font-bold ${styles.numColor} whitespace-nowrap`}>{remaining}</span>
                <span className="text-[9px] text-gray-400">/</span>
                <span className="text-[9px] text-gray-400">{total}</span>
                {tier !== 'none' && (
                    <AlertTriangle className={`w-2.5 h-2.5 ${styles.labelColor} ${tier === 'critical' ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                )}
            </div>

            {/* Label + mini bar */}
            <div className="flex flex-col items-center w-full gap-0.5 mt-0.5">
                <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${styles.labelColor || 'text-gray-400'}`}>{label}</span>
                <div className="w-full h-[2px] bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${styles.barColor}`} style={{ width: `${pct}%` }} />
                </div>
            </div>

            {/* Hover tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 pointer-events-none z-[200] shadow-xl transition-all duration-200 -translate-y-1 group-hover:translate-y-0 flex flex-col gap-1">
                <div className="font-semibold">{label} Credits</div>
                <div className="flex justify-between text-gray-300">
                    <span>Remaining</span>
                    <span className={tier !== 'none' ? styles.numColor : 'text-green-400'}>{remaining}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                    <span>Plan Total</span><span>{total}</span>
                </div>
                <div className="border-t border-gray-700 mt-1 pt-1">
                    <div className="flex justify-between text-gray-400"><span>Used</span><span>{pct}%</span></div>
                    <div className="w-full h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${styles.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                </div>
                {tier !== 'none' && (
                    <div className={`text-[10px] font-medium mt-0.5 ${styles.numColor}`}>
                        {tier === 'critical' ? '⚠ Critical — top up now!' : tier === 'high' ? '⚡ Running low' : '💡 Over 70% used'}
                    </div>
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 mb-[-4px]" />
            </div>
        </button>
    );
};

const ThinDivider = () => <div className="w-px h-6 bg-gray-100 mx-0.5 self-center shrink-0" />;
// Slightly thicker divider between the two groups
const GroupDivider = () => <div className="w-px h-8 bg-gray-200 mx-1 self-center shrink-0" />;

// ─── Main Component ────────────────────────────────────────────────────────────
const GlobalCreditDisplay = ({ onTopUpClick }) => {
    const navigate = useNavigate();
    const { subscriptions } = useSubscription();

    const planLimits = useMemo(() => {
        const sub360 = subscriptions?.salespal360;
        const subMkt = subscriptions?.marketing;
        const activeSub = sub360?.active ? sub360 : subMkt?.active ? subMkt : null;
        const lim = activeSub?.limits || {};
        return {
            images: lim.images ?? 20,
            videos: lim.videos ?? 4,
            calls: lim.calls ?? 500,
            sms: lim.sms ?? 1000,
            rcs: lim.rcs ?? 500,
            whatsapp: lim.whatsapp ?? 300,
        };
    }, [subscriptions]);

    const credits = useMemo(() => {
        const sub360 = subscriptions?.salespal360;
        const subMkt = subscriptions?.marketing;
        const activeSub = sub360?.active ? sub360 : subMkt?.active ? subMkt : null;
        const usage = activeSub?.usage || {};
        const remain = (key, total) => Math.max(0, total - (usage[key] ?? 0));

        return {
            images: { remaining: remain('images', planLimits.images), total: planLimits.images },
            videos: { remaining: remain('videos', planLimits.videos), total: planLimits.videos },
            calls: { remaining: remain('calls', planLimits.calls), total: planLimits.calls },
            sms: { remaining: remain('sms', planLimits.sms), total: planLimits.sms },
            rcs: { remaining: remain('rcs', planLimits.rcs), total: planLimits.rcs },
            whatsapp: { remaining: remain('whatsapp', planLimits.whatsapp), total: planLimits.whatsapp },
        };
    }, [subscriptions, planLimits]);

    const hasLowCredit = useMemo(() =>
        Object.values(credits).some(({ remaining, total }) => total > 0 && remaining / total <= 0.30)
        , [credits]);

    const handleTopUp = () => onTopUpClick ? onTopUpClick() : navigate('/subscription');

    return (
        <div className="flex items-center gap-2">

            {/* ── Single horizontal pill strip ── */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-1 py-0.5 shadow-sm">

                {/* Group 1 — Creative */}
                <CreditPill icon={Image} label="Images" remaining={credits.images.remaining} total={credits.images.total} onClick={() => navigate('/marketing/photos')} />
                <ThinDivider />
                <CreditPill icon={Video} label="Videos" remaining={credits.videos.remaining} total={credits.videos.total} onClick={() => navigate('/marketing/videos')} />
                <ThinDivider />
                <CreditPill icon={Phone} label="Calls" remaining={credits.calls.remaining} total={credits.calls.total} onClick={() => navigate('/marketing/calls')} />

                {/* Group separator */}
                <GroupDivider />

                {/* Group 2 — Communication */}
                <CreditPill icon={MessageSquare} label="SMS" remaining={credits.sms.remaining} total={credits.sms.total} onClick={() => navigate('/marketing/campaigns')} />
                <ThinDivider />
                <CreditPill icon={Radio} label="RCS" remaining={credits.rcs.remaining} total={credits.rcs.total} onClick={() => navigate('/marketing/campaigns')} />
                <ThinDivider />
                <CreditPill icon={MessageCircle} label="WhatsApp" remaining={credits.whatsapp.remaining} total={credits.whatsapp.total} onClick={() => navigate('/marketing/whatsapp')} />
            </div>

            {/* ── Top Up CTA ── */}
            {hasLowCredit ? (
                <button
                    type="button"
                    onClick={handleTopUp}
                    className="flex items-center gap-1.5 pl-3 pr-1 py-1 bg-white hover:bg-amber-50 border border-amber-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap group"
                    title="Credits running low — top up now"
                >
                    <Zap className="w-3 h-3 text-amber-500" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-amber-600">Top Up</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 group-hover:bg-amber-200 rounded-full transition-colors">
                        <Plus className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleTopUp}
                    className="flex items-center gap-1.5 pl-3 pr-1 py-1 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
                    title="Top Up Credits"
                >
                    <span className="text-xs font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Top Up</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 group-hover:bg-gray-200 rounded-full transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" strokeWidth={2.5} />
                    </span>
                </button>
            )}
        </div>
    );
};

export default GlobalCreditDisplay;

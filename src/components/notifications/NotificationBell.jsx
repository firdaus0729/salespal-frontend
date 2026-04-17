import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, X, CheckCheck, ChevronRight,
    CreditCard, Megaphone, Zap, Settings, Headphones,
    MessageSquare, Phone, Radio, Layers,
    AlertTriangle, Info, ExternalLink
} from 'lucide-react';
import { useNotifications, CHANNELS, PRIORITY } from '../../context/NotificationContext';

// ─── Channel tab definitions ──────────────────────────────────────────────────
const CHANNEL_TABS = [
    {
        key: 'all',
        label: 'All',
        icon: Bell,
        color: 'text-gray-500',
        activeColor: 'bg-gray-800 text-white',
        ringColor: 'ring-gray-300',
    },
    {
        key: CHANNELS.IN_APP,
        label: 'In-App',
        icon: Bell,
        color: 'text-blue-500',
        activeColor: 'bg-blue-600 text-white',
        ringColor: 'ring-blue-200',
        badgeBg: 'bg-blue-500',
    },
    {
        key: CHANNELS.WHATSAPP,
        label: 'WhatsApp',
        icon: MessageSquare,
        color: 'text-emerald-600',
        activeColor: 'bg-emerald-600 text-white',
        ringColor: 'ring-emerald-200',
        badgeBg: 'bg-emerald-500',
    },
    {
        key: CHANNELS.RCS,
        label: 'RCS',
        icon: Radio,
        color: 'text-purple-600',
        activeColor: 'bg-purple-600 text-white',
        ringColor: 'ring-purple-200',
        badgeBg: 'bg-purple-500',
    },
    {
        key: CHANNELS.SMS,
        label: 'SMS',
        icon: Phone,
        color: 'text-green-600',
        activeColor: 'bg-green-600 text-white',
        ringColor: 'ring-green-200',
        badgeBg: 'bg-green-500',
    },
    {
        key: CHANNELS.BULK,
        label: 'Bulk',
        icon: Layers,
        color: 'text-orange-500',
        activeColor: 'bg-orange-500 text-white',
        ringColor: 'ring-orange-200',
        badgeBg: 'bg-orange-500',
    },
];

// ─── Category icon map ────────────────────────────────────────────────────────
const CATEGORY_CFG = {
    billing: { icon: CreditCard, bg: 'bg-violet-100', color: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
    credit: { icon: Zap, bg: 'bg-amber-100', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
    campaign: { icon: Megaphone, bg: 'bg-blue-100', color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
    system: { icon: Settings, bg: 'bg-gray-100', color: 'text-gray-500', badge: 'bg-gray-50 text-gray-600 ring-gray-200', dot: 'bg-gray-400' },
    support: { icon: Headphones, bg: 'bg-green-100', color: 'text-green-600', badge: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-500' },
    marketing: { icon: Megaphone, bg: 'bg-pink-100', color: 'text-pink-600', badge: 'bg-pink-50 text-pink-700 ring-pink-200', dot: 'bg-pink-500' },
};

// ─── Channel icon + colors ────────────────────────────────────────────────────
const CHANNEL_ICON_CFG = {
    [CHANNELS.IN_APP]: { Icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In-App' },
    [CHANNELS.WHATSAPP]: { Icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'WhatsApp' },
    [CHANNELS.RCS]: { Icon: Radio, color: 'text-purple-600', bg: 'bg-purple-50', label: 'RCS' },
    [CHANNELS.SMS]: { Icon: Phone, color: 'text-green-600', bg: 'bg-green-50', label: 'SMS' },
    [CHANNELS.BULK]: { Icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Bulk' },
};

// ─── Priority styling ─────────────────────────────────────────────────────────
const PRIORITY_CFG = {
    [PRIORITY.CRITICAL]: { border: 'border-l-2 border-r-0 border-t-0 border-b-0 border-red-400', unreadBg: 'bg-red-50/60', },
    [PRIORITY.NORMAL]: { border: '', unreadBg: 'bg-blue-50/50' },
    [PRIORITY.LOW]: { border: '', unreadBg: 'bg-gray-50/50' },
};

// ─── Relative time ─────────────────────────────────────────────────────────────
const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'yesterday';
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Single notification row ───────────────────────────────────────────────────
const NotificationRow = ({ notif, onRead, onDismiss, onNavigate }) => {
    const cat = CATEGORY_CFG[notif.type] || CATEGORY_CFG.system;
    const chCfg = CHANNEL_ICON_CFG[notif.channel_type] || CHANNEL_ICON_CFG[CHANNELS.IN_APP];
    const pCfg = PRIORITY_CFG[notif.priority] || PRIORITY_CFG[PRIORITY.NORMAL];
    const CatIcon = cat.icon;
    const ChIcon = chCfg.Icon;

    const handleClick = () => {
        onRead(notif.id);
        if (notif.link) onNavigate(notif.link);
    };

    const isCritical = notif.priority === PRIORITY.CRITICAL;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.17 }}
            className={`
                group relative flex gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2
                ${!notif.read
                    ? isCritical
                        ? 'border-red-400 bg-red-50/50 hover:bg-red-50'
                        : 'border-blue-400 bg-blue-50/40 hover:bg-blue-50/60'
                    : 'border-transparent hover:bg-gray-50'
                }
            `}
            onClick={handleClick}
        >
            {/* Category icon */}
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
                <CatIcon className={`w-4 h-4 ${cat.color}`} strokeWidth={1.8} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {isCritical && (
                            <AlertTriangle className="inline w-3 h-3 text-red-500 mr-1 -mt-0.5" strokeWidth={2.5} />
                        )}
                        {notif.title}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                        {relativeTime(notif.timestamp)}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.description}
                </p>

                {/* Footer tags */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {/* Channel badge */}
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ring-1 ${chCfg.bg} ${chCfg.color} ring-current/20`}>
                        <ChIcon className="w-2.5 h-2.5" strokeWidth={2} />
                        {chCfg.label}
                    </span>

                    {/* Delivery status */}
                    {notif.delivery_status === 'delivered' && (
                        <span className="text-[9px] text-green-600 font-semibold">✓ Delivered</span>
                    )}
                    {notif.delivery_status === 'failed' && (
                        <span className="text-[9px] text-red-500 font-semibold">✗ Failed</span>
                    )}

                    {/* View link hint */}
                    {notif.link && (
                        <span className="ml-auto text-[10px] text-blue-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                    )}
                </div>
            </div>

            {/* Dismiss */}
            <button
                onClick={e => { e.stopPropagation(); onDismiss(notif.id); }}
                className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                title="Dismiss"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
};

// ─── Main bell component ───────────────────────────────────────────────────────
const NotificationBell = () => {
    const navigate = useNavigate();
    const {
        notifications, unreadCount, channelUnreadCounts,
        markRead, markAllRead, dismissNotification
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [isNewShake, setIsNewShake] = useState(false);
    const panelRef = useRef(null);
    const bellRef = useRef(null);
    const lastSeenIdRef = useRef(notifications[0]?.id ?? null);

    // ── Detect new notification arrival ───────────────────────────────
    const latestId = notifications[0]?.id ?? null;
    useEffect(() => {
        if (latestId && latestId !== lastSeenIdRef.current) {
            lastSeenIdRef.current = latestId;
            setIsNewShake(true);
            const timer = setTimeout(() => setIsNewShake(false), 700);
            return () => clearTimeout(timer);
        }
    }, [latestId]);

    // ── Bell animation variants ───────────────────────────────────────
    const bellAnimate = useMemo(() => {
        if (isNewShake) {
            return {
                rotate: [0, 18, -14, 10, -8, 0],
                transition: { duration: 0.6, ease: 'easeInOut' },
            };
        }
        if (unreadCount > 0 && !isOpen) {
            return {
                rotate: [0, 8, -8, 6, -6, 0],
                transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.5 },
            };
        }
        return { rotate: 0 };
    }, [isNewShake, unreadCount, isOpen]);

    // Close on outside click / Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleOutside = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) setIsOpen(false);
        };
        const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    // Filter by tab
    const filtered = notifications.filter(n => {
        if (activeTab === 'all') return true;
        return n.channel_type === activeTab;
    });

    const criticalCount = notifications.filter(n => !n.read && n.priority === PRIORITY.CRITICAL).length;

    const activeTabCfg = CHANNEL_TABS.find(t => t.key === activeTab) || CHANNEL_TABS[0];

    const handleNavigate = useCallback((link) => {
        setIsOpen(false);
        navigate(link);
    }, [navigate]);

    const handleMarkAllRead = () => {
        markAllRead(activeTab === 'all' ? null : activeTab);
    };

    const tabUnread = (tab) => {
        if (tab.key === 'all') return unreadCount;
        return channelUnreadCounts[tab.key] || 0;
    };

    return (
        <div className="relative">
            {/* ── Bell Button ── */}
            <button
                ref={bellRef}
                type="button"
                id="notification-bell-btn"
                onClick={() => setIsOpen(prev => !prev)}
                className={`
                    relative flex items-center justify-center
                    w-8 h-8 rounded-xl transition-all duration-200
                    ${isOpen
                        ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }
                `}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
            >
                <motion.div
                    animate={bellAnimate}
                    style={{ transformOrigin: 'top center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Bell 
                        style={{ width: 18, height: 18 }} 
                        strokeWidth={isOpen ? 2.5 : 2} 
                    />
                </motion.div>

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`
                                absolute -top-1 -right-1 min-w-[16px] h-4 px-1
                                text-white text-[9px] font-bold rounded-full
                                flex items-center justify-center ring-2 ring-white leading-none
                                ${criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}
                            `}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* ── Dropdown Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        key="notif-panel"
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[300] flex flex-col overflow-hidden"
                        style={{ maxHeight: 'calc(100vh - 100px)' }}
                    >
                        {/* ── Panel Header ── */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-gray-700" strokeWidth={2} />
                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ${criticalCount > 0 ? 'bg-red-500' : 'bg-blue-600'}`}>
                                        {unreadCount} new
                                    </span>
                                )}
                                {criticalCount > 0 && (
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full ring-1 ring-red-200">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        {criticalCount} critical
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {filtered.some(n => !n.read) && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* ── Channel Tabs ── */}
                        <div className="flex items-center gap-1 px-3 pt-2 pb-2 border-b border-gray-100 overflow-x-auto scrollbar-hide shrink-0 bg-white">
                            {CHANNEL_TABS.map(tab => {
                                const TabIcon = tab.icon;
                                const count = tabUnread(tab);
                                const isActive = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`
                                            relative shrink-0 flex items-center gap-1.5
                                            text-[10px] font-semibold px-2.5 py-1.5 rounded-xl
                                            transition-all duration-150 whitespace-nowrap
                                            ${isActive
                                                ? tab.activeColor + ' shadow-sm'
                                                : `text-gray-500 hover:text-gray-700 hover:bg-gray-100`
                                            }
                                        `}
                                    >
                                        <TabIcon className={`w-3 h-3 ${isActive ? 'opacity-90' : tab.color}`} strokeWidth={2} />
                                        {tab.label}
                                        {/* Per-tab unread badge */}
                                        {count > 0 && (
                                            <span className={`
                                                min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold leading-none
                                                flex items-center justify-center
                                                ${isActive
                                                    ? 'bg-white/25 text-white'
                                                    : `${tab.badgeBg || 'bg-gray-400'} text-white`
                                                }
                                            `}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── Tab description strip ── */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="px-4 py-1.5 bg-gray-50/70 border-b border-gray-100 shrink-0"
                            >
                                {activeTab === 'all' && (
                                    <p className="text-[10px] text-gray-400">All channels — dashboard, WhatsApp, RCS, SMS &amp; bulk broadcasts</p>
                                )}
                                {activeTab === CHANNELS.IN_APP && (
                                    <p className="text-[10px] text-blue-500">Dashboard alerts, campaign warnings, billing notices</p>
                                )}
                                {activeTab === CHANNELS.WHATSAPP && (
                                    <p className="text-[10px] text-emerald-600">Sent WhatsApp alerts, delivery confirmations, campaign updates</p>
                                )}
                                {activeTab === CHANNELS.RCS && (
                                    <p className="text-[10px] text-purple-500">Rich message updates, delivery reports, campaign analytics</p>
                                )}
                                {activeTab === CHANNELS.SMS && (
                                    <p className="text-[10px] text-green-600">OTP alerts, billing reminders, transaction confirmations</p>
                                )}
                                {activeTab === CHANNELS.BULK && (
                                    <p className="text-[10px] text-orange-500">Bulk WhatsApp status, SMS reports, RCS campaign performance</p>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* ── Notification List ── */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50/80">
                            <AnimatePresence mode="popLayout">
                                {filtered.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-14 text-center"
                                    >
                                        {activeTabCfg && (
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <activeTabCfg.icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                                            </div>
                                        )}
                                        <p className="text-sm font-medium text-gray-700">No {activeTabCfg.label} notifications</p>
                                        <p className="text-xs text-gray-400 mt-1">You're all caught up on this channel.</p>
                                    </motion.div>
                                ) : (
                                    filtered.map(notif => (
                                        <NotificationRow
                                            key={notif.id}
                                            notif={notif}
                                            onRead={markRead}
                                            onDismiss={dismissNotification}
                                            onNavigate={handleNavigate}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Panel Footer ── */}
                        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80 shrink-0 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">
                                {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                                {activeTab !== 'all' && ` · ${activeTabCfg.label}`}
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleNavigate('/notifications')}
                                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                                >
                                    View all
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                                <span className="text-gray-200">|</span>
                                <button
                                    onClick={() => handleNavigate('/settings/notifications')}
                                    className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                                >
                                    Settings
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;

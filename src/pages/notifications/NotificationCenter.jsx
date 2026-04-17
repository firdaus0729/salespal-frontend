import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, MessageSquare, Phone, Radio, Layers, Search,
    CheckCheck, Trash2, X, AlertTriangle, Info, ChevronRight,
    Filter, SlidersHorizontal, CreditCard, Megaphone, Zap,
    Settings, Headphones, ExternalLink, RotateCcw
} from 'lucide-react';
import { useNotifications, CHANNELS, PRIORITY } from '../../context/NotificationContext';

// ─── Channel config ────────────────────────────────────────────────────────────
const CHANNEL_TABS = [
    { key: 'all', label: 'All', Icon: Bell, color: 'text-gray-600', activeBg: 'bg-gray-800 text-white', dot: 'bg-gray-400' },
    { key: CHANNELS.IN_APP, label: 'In-App', Icon: Bell, color: 'text-blue-600', activeBg: 'bg-blue-600 text-white', dot: 'bg-blue-500' },
    { key: CHANNELS.WHATSAPP, label: 'WhatsApp', Icon: MessageSquare, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white', dot: 'bg-emerald-500' },
    { key: CHANNELS.RCS, label: 'RCS', Icon: Radio, color: 'text-purple-600', activeBg: 'bg-purple-600 text-white', dot: 'bg-purple-500' },
    { key: CHANNELS.SMS, label: 'SMS', Icon: Phone, color: 'text-green-600', activeBg: 'bg-green-600 text-white', dot: 'bg-green-500' },
    { key: CHANNELS.BULK, label: 'Bulk', Icon: Layers, color: 'text-orange-500', activeBg: 'bg-orange-500 text-white', dot: 'bg-orange-400' },
];

const CHANNEL_ICON_CFG = {
    [CHANNELS.IN_APP]: { Icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In-App' },
    [CHANNELS.WHATSAPP]: { Icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'WhatsApp' },
    [CHANNELS.RCS]: { Icon: Radio, color: 'text-purple-600', bg: 'bg-purple-50', label: 'RCS' },
    [CHANNELS.SMS]: { Icon: Phone, color: 'text-green-600', bg: 'bg-green-50', label: 'SMS' },
    [CHANNELS.BULK]: { Icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Bulk' },
};

const CATEGORY_CFG = {
    billing: { icon: CreditCard, bg: 'bg-violet-100', color: 'text-violet-600' },
    credit: { icon: Zap, bg: 'bg-amber-100', color: 'text-amber-600' },
    campaign: { icon: Megaphone, bg: 'bg-blue-100', color: 'text-blue-600' },
    system: { icon: Settings, bg: 'bg-gray-100', color: 'text-gray-500' },
    support: { icon: Headphones, bg: 'bg-green-100', color: 'text-green-600' },
    marketing: { icon: Megaphone, bg: 'bg-pink-100', color: 'text-pink-600' },
};

const PRIORITY_LABEL = {
    [PRIORITY.CRITICAL]: { label: 'Critical', cls: 'bg-red-50 text-red-600 ring-red-200' },
    [PRIORITY.NORMAL]: { label: 'Normal', cls: 'bg-blue-50 text-blue-600 ring-blue-200' },
    [PRIORITY.LOW]: { label: 'Low', cls: 'bg-gray-50 text-gray-500 ring-gray-200' },
};

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
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

// ─── Notification Card ─────────────────────────────────────────────────────────
const NotifCard = ({ notif, onRead, onDismiss, onNavigate }) => {
    const cat = CATEGORY_CFG[notif.type] || CATEGORY_CFG.system;
    const chCfg = CHANNEL_ICON_CFG[notif.channel_type] || CHANNEL_ICON_CFG[CHANNELS.IN_APP];
    const pCfg = PRIORITY_LABEL[notif.priority] || PRIORITY_LABEL[PRIORITY.NORMAL];
    const CatIcon = cat.icon;
    const ChIcon = chCfg.Icon;
    const isCritical = notif.priority === PRIORITY.CRITICAL;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className={`
                group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer
                ${!notif.read
                    ? isCritical
                        ? 'bg-red-50/40 border-red-200 hover:bg-red-50'
                        : 'bg-blue-50/30 border-blue-200 hover:bg-blue-50/50'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }
            `}
            onClick={() => { onRead(notif.id); if (notif.link) onNavigate(notif.link); }}
        >
            {/* Unread dot */}
            {!notif.read && (
                <span className={`absolute top-4 left-2 w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`} />
            )}

            {/* Category icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                <CatIcon className={`w-5 h-5 ${cat.color}`} strokeWidth={1.8} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm leading-snug ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {isCritical && <AlertTriangle className="inline w-3.5 h-3.5 text-red-500 mr-1 -mt-0.5" />}
                        {notif.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{relativeTime(notif.timestamp)}</span>
                </div>

                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.description}</p>

                <div className="flex items-center flex-wrap gap-2 mt-2">
                    {/* Channel */}
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${chCfg.bg} ${chCfg.color}`}>
                        <ChIcon className="w-2.5 h-2.5" strokeWidth={2} />
                        {chCfg.label}
                    </span>

                    {/* Priority */}
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ${pCfg.cls}`}>
                        {pCfg.label}
                    </span>

                    {/* Delivery */}
                    {notif.delivery_status === 'delivered' && (
                        <span className="text-[9px] font-semibold text-green-600">✓ Delivered</span>
                    )}
                    {notif.delivery_status === 'failed' && (
                        <span className="text-[9px] font-semibold text-red-500">✗ Failed</span>
                    )}

                    {notif.link && (
                        <span className="ml-auto text-[10px] text-blue-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-3 h-3" />
                        </span>
                    )}
                </div>
            </div>

            {/* Dismiss */}
            <button
                onClick={e => { e.stopPropagation(); onDismiss(notif.id); }}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all self-start"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const NotificationCenter = () => {
    const navigate = useNavigate();
    const {
        notifications, unreadCount, channelUnreadCounts,
        markRead, markAllRead, dismissNotification, clearAll
    } = useNotifications();

    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // Derived
    const filtered = useMemo(() => {
        return notifications.filter(n => {
            if (activeTab !== 'all' && n.channel_type !== activeTab) return false;
            if (showUnreadOnly && n.read) return false;
            if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return n.title.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [notifications, activeTab, showUnreadOnly, priorityFilter, search]);

    const tabUnread = (key) => {
        if (key === 'all') return unreadCount;
        return channelUnreadCounts[key] || 0;
    };

    const handleMarkAllRead = () => markAllRead(activeTab === 'all' ? null : activeTab);
    const handleClearAll = () => clearAll(activeTab === 'all' ? null : activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-blue-600" strokeWidth={2} />
                            Notification Center
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            All your alerts across In-App, WhatsApp, RCS, SMS and Bulk channels
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                        <button
                            onClick={() => navigate('/settings/notifications')}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-white transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </button>
                    </div>
                </div>

                {/* ── Stats strip ── */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {CHANNEL_TABS.filter(t => t.key !== 'all').map(tab => {
                        const count = tabUnread(tab.key);
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${activeTab === tab.key
                                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <tab.Icon className={`w-4 h-4 ${tab.color}`} strokeWidth={1.8} />
                                <span className="text-[10px] font-semibold text-gray-600">{tab.label}</span>
                                <span className={`text-sm font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Search + filters ── */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notifications…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Priority filter */}
                    <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                    >
                        <option value="all">All priorities</option>
                        <option value="critical">Critical</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>

                    {/* Unread toggle */}
                    <button
                        onClick={() => setShowUnreadOnly(v => !v)}
                        className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border transition-all ${showUnreadOnly
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Unread only
                    </button>
                </div>

                {/* ── Channel Tabs ── */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
                    {CHANNEL_TABS.map(tab => {
                        const count = tabUnread(tab.key);
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
                                    transition-all duration-150 whitespace-nowrap
                                    ${isActive ? tab.activeBg + ' shadow-sm' : `${tab.color} bg-white border border-gray-200 hover:border-gray-300`}
                                `}
                            >
                                <tab.Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={handleClearAll}
                            className="shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* ── Notification List ── */}
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <Bell className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-base font-semibold text-gray-700">No notifications found</p>
                            <p className="text-sm text-gray-400 mt-1 max-w-xs">
                                {search ? `No results for "${search}"` : "You're all caught up on this channel."}
                            </p>
                            {(search || showUnreadOnly || priorityFilter !== 'all') && (
                                <button
                                    onClick={() => { setSearch(''); setShowUnreadOnly(false); setPriorityFilter('all'); }}
                                    className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Clear filters
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(notif => (
                                <NotifCard
                                    key={notif.id}
                                    notif={notif}
                                    onRead={markRead}
                                    onDismiss={dismissNotification}
                                    onNavigate={(link) => navigate(link)}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Bottom link ── */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/settings/notifications')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Configure notification preferences
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;

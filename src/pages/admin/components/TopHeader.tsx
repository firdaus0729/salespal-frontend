import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Loader2, Check, CheckCheck, UserPlus, Shield, Megaphone, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

const POLL_INTERVAL = 30000; // 30 seconds

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    source: string;
    created_at: string;
}

const typeIcons: Record<string, React.ElementType> = {
    registration: UserPlus,
    audit: Shield,
    broadcast: Megaphone,
    system: AlertCircle,
};

const typeColors: Record<string, string> = {
    registration: 'text-emerald-600 bg-emerald-50',
    audit: 'text-purple-600 bg-purple-50',
    broadcast: 'text-orange-600 bg-orange-50',
    system: 'text-blue-600 bg-blue-50',
};

const timeAgo = (dateStr: string): string => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

interface TopHeaderProps {
    title: string;
    subtitle?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async (showLoader = false) => {
        try {
            if (showLoader) setLoading(true);
            const data = await api.get('/admin/notifications');
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch admin notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchNotifications(true);
        const interval = setInterval(() => fetchNotifications(false), POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkRead = async (id: string) => {
        if (typeof id === 'string' && (id.startsWith('audit-') || id.startsWith('reg-'))) return;
        try {
            await api.put(`/admin/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setMarkingAll(true);
            await api.put('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications read:', err);
        } finally {
            setMarkingAll(false);
        }
    };

    return (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setShowNotifications((p) => !p);
                            if (!showNotifications) fetchNotifications(false);
                        }}
                        className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Bell
                            size={19}
                            strokeWidth={1.5}
                            className={unreadCount > 0 ? 'text-blue-600' : ''}
                        />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-700 font-medium px-1.5 py-0.5 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        disabled={markingAll}
                                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {markingAll ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <CheckCheck size={12} />
                                        )}
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Body */}
                            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                                {loading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 size={20} className="animate-spin text-gray-400" />
                                        <span className="ml-2 text-sm text-gray-400">Loading…</span>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                        <Bell size={28} strokeWidth={1.2} className="mb-2 text-gray-300" />
                                        <p className="text-sm font-medium">No notifications yet</p>
                                        <p className="text-xs mt-0.5">Platform events will appear here</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const IconComp = typeIcons[n.type] || AlertCircle;
                                        const colorClass = typeColors[n.type] || typeColors.system;
                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => !n.read && handleMarkRead(n.id)}
                                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    !n.read ? 'bg-blue-50/40' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                                                        <IconComp size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {!n.read && (
                                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                                            )}
                                                            <p className="text-sm text-gray-800 truncate">{n.message}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                                                    </div>
                                                    {!n.read && n.source === 'notification' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkRead(n.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                                    <span className="text-xs text-gray-400">
                                        Showing {notifications.length} most recent events
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopHeader;

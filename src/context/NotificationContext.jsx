import React, {
    createContext, useContext, useState, useRef,
    useEffect, useCallback, useMemo
} from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { playNotificationSound, isSoundEnabled, setSoundEnabled as persistSoundEnabled } from '../utils/notificationSound';

// ─── Channel constants ─────────────────────────────────────────────────────────
export const CHANNELS = {
    IN_APP: 'in_app',
    SMS: 'sms',
    RCS: 'rcs',
    WHATSAPP: 'whatsapp',
    BULK: 'bulk',
};

export const PRIORITY = {
    CRITICAL: 'critical',
    NORMAL: 'normal',
    LOW: 'low',
};

export const DELIVERY_STATUS = {
    PENDING: 'pending',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    SKIPPED: 'skipped',
};

// ─── Notification schema ───────────────────────────────────────────────────────
// {
//   id, user_id, type (category), subtype,
//   channel_type: 'in_app' | 'whatsapp' | 'rcs' | 'sms' | 'bulk',
//   title, description, link,
//   priority: 'critical' | 'normal' | 'low',
//   delivery_status: 'delivered' | 'failed' | 'pending',
//   read, dismissed, timestamp, created_at,
// }

const STORAGE_KEY = 'salespal_notifications_v4';
const PREFS_STORAGE_KEY = 'salespal_notif_prefs_v2';

// ─── Default preferences ──────────────────────────────────────────────────────
export const DEFAULT_PREFS = {
    channels: {
        in_app: true,
        sms: false,
        rcs: false,
        whatsapp: false,
        bulk: false,
    },
    consent: {
        sms: false,
        rcs: false,
        whatsapp: false,
        bulk_whatsapp: false,
    },
    categories: {
        billing: { enabled: true, subtypes: { invoices: true, payment_reminders: true, credit_warnings: true } },
        campaign: { enabled: true, subtypes: { performance_alerts: true, budget_alerts: true, conversion_insights: false } },
        system: { enabled: true, subtypes: { feature_updates: true, maintenance_alerts: true } },
        marketing: { enabled: false, subtypes: { product_announcements: false, offers: false } },
        credit: { enabled: true, subtypes: { low_warning: true, exhausted: true } },
        support: { enabled: true, subtypes: { ticket_updates: true } },
    },
    frequency: {
        limit_critical_per_day: 5,
        quiet_hours_enabled: false,
        quiet_start: '22:00',
        quiet_end: '08:00',
        batch_normal: false,
    },
};

// ─── NOTE: Notification data is fetched from the backend via API polling (30s).
// ─── Local notifications can still be added via addNotification().
// ─── localStorage is used as a cache for immediate UI responsiveness.


// ─── Storage helpers ──────────────────────────────────────────────────────────
const loadNotifications = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /**/ }
    return null;
};
const saveNotifications = (n) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch { /**/ }
};

const loadPrefs = () => {
    try {
        const raw = localStorage.getItem(PREFS_STORAGE_KEY);
        if (raw) return deepMerge(DEFAULT_PREFS, JSON.parse(raw));
    } catch { /**/ }
    return DEFAULT_PREFS;
};
const savePrefs = (p) => {
    try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p)); } catch { /**/ }
};

function deepMerge(defaults, override) {
    const result = { ...defaults };
    for (const key of Object.keys(override)) {
        if (override[key] !== null && typeof override[key] === 'object' && !Array.isArray(override[key]) && key in result) {
            result[key] = deepMerge(result[key], override[key]);
        } else {
            result[key] = override[key];
        }
    }
    return result;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // Initialise from localStorage; starts empty on first load.
    const [notifications, setNotifications] = useState(() => {
        const stored = loadNotifications();
        if (stored && Array.isArray(stored) && stored.length > 0) return stored;
        return [];
    });

    const [prefs, setPrefs] = useState(loadPrefs);
    const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled);
    const lastSeenNotifIdRef = useRef(null);

    // ── Fetching logic ───────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await api.get('/notifications');
            if (data && Array.isArray(data.notifications)) {
                // Map backend fields to frontend schema
                const mapped = data.notifications.map(n => ({
                    id: n.id,
                    user_id: n.user_id,
                    type: n.type || 'system',
                    channel_type: n.channel_type || CHANNELS.IN_APP,
                    title: n.title,
                    description: n.message || n.body,
                    link: n.metadata?.link || null,
                    priority: n.metadata?.priority || PRIORITY.NORMAL,
                    delivery_status: n.metadata?.delivery_status || DELIVERY_STATUS.DELIVERED,
                    read: n.read,
                    dismissed: false, // dismiss state is usually session-based or local for now
                    timestamp: n.created_at,
                    created_at: n.created_at,
                }));

                setNotifications(prev => {
                    // Merge: Keep local ones that haven't been dismissed, 
                    // but prioritize server truth for existing ones.
                    const serverIds = new Set(mapped.map(m => m.id));
                    const results = [...mapped];
                    
                    prev.forEach(p => {
                        if (!serverIds.has(p.id) && !p.id.startsWith('notif_')) {
                            // Don't keep non-local IDs that aren't in server results
                        } else if (p.id.startsWith('notif_')) {
                            results.push(p); // keep local optimistic ones
                        }
                    });
                    
                    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [isAuthenticated]);

    // Initial fetch + Polling (30s)
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotifications]);

    useEffect(() => { saveNotifications(notifications); }, [notifications]);
    useEffect(() => { savePrefs(prefs); }, [prefs]);

    // ── Sound on new notification ─────────────────────────────────────────
    const latestNotifId = notifications[0]?.id ?? null;
    useEffect(() => {
        if (latestNotifId && latestNotifId !== lastSeenNotifIdRef.current) {
            const isFirstLoad = lastSeenNotifIdRef.current === null;
            lastSeenNotifIdRef.current = latestNotifId;
            // Don't play on first load, only on genuinely new arrivals
            if (!isFirstLoad && soundEnabled) {
                playNotificationSound();
            }
        }
    }, [latestNotifId, soundEnabled]);

    // ── Sound toggle handler ──────────────────────────────────────────────
    const setSoundEnabled = useCallback((enabled) => {
        setSoundEnabledState(enabled);
        persistSoundEnabled(enabled);
    }, []);

    // ── Derived counts ────────────────────────────────────────────────────
    const visibleNotifications = useMemo(
        () => notifications.filter(n => !n.dismissed),
        [notifications]
    );

    const unreadCount = useMemo(
        () => visibleNotifications.filter(n => !n.read).length,
        [visibleNotifications]
    );

    // Per-channel unread count map
    const channelUnreadCounts = useMemo(() => {
        const counts = { in_app: 0, whatsapp: 0, rcs: 0, sms: 0, bulk: 0 };
        visibleNotifications.forEach(n => {
            if (!n.read && n.channel_type && n.channel_type in counts) {
                counts[n.channel_type]++;
            }
        });
        return counts;
    }, [visibleNotifications]);

    // ── Actions ───────────────────────────────────────────────────────────
    const markRead = useCallback(async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        
        // Sync with backend if it's a server notification (UUID)
        if (id && typeof id === 'string' && !id.startsWith('notif_')) {
            try {
                await api.put(`/notifications/${id}/read`);
            } catch (error) {
                console.error('Failed to mark notification read on server:', error);
            }
        }
    }, []);

    const markAllRead = useCallback(async (channelFilter = null) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => {
            if (channelFilter && n.channel_type !== channelFilter) return n;
            return { ...n, read: true };
        }));

        // Sync with backend
        try {
            await api.put('/notifications/read-all');
        } catch (error) {
            console.error('Failed to mark all notifications read on server:', error);
        }
    }, []);

    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
    }, []);

    const addNotification = useCallback((notif) => {
        const newNotif = {
            id: `notif_${Date.now()}`,
            channel_type: CHANNELS.IN_APP,
            priority: PRIORITY.NORMAL,
            delivery_status: DELIVERY_STATUS.DELIVERED,
            read: false,
            dismissed: false,
            timestamp: new Date().toISOString(),
            ...notif,
        };
        setNotifications(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
        });
    }, []);

    const clearAll = useCallback((channelFilter = null) => {
        setNotifications(prev => prev.map(n => {
            if (channelFilter && n.channel_type !== channelFilter) return n;
            return { ...n, dismissed: true };
        }));
    }, []);

    // ── Preference helpers ────────────────────────────────────────────────
    const updateChannelPref = useCallback((ch, val) => setPrefs(p => ({ ...p, channels: { ...p.channels, [ch]: val } })), []);
    const updateConsent = useCallback((ch, val) => setPrefs(p => ({ ...p, consent: { ...p.consent, [ch]: val }, channels: val ? { ...p.channels, [ch]: true } : p.channels })), []);
    const updateCategoryPref = useCallback((cat, val) => setPrefs(p => ({ ...p, categories: { ...p.categories, [cat]: { ...p.categories[cat], enabled: val } } })), []);
    const updateSubtypePref = useCallback((cat, sub, val) => setPrefs(p => ({ ...p, categories: { ...p.categories, [cat]: { ...p.categories[cat], subtypes: { ...p.categories[cat].subtypes, [sub]: val } } } })), []);
    const updateFrequencyPref = useCallback((key, val) => setPrefs(p => ({ ...p, frequency: { ...p.frequency, [key]: val } })), []);
    const resetPrefs = useCallback(() => setPrefs(DEFAULT_PREFS), []);


    return (
        <NotificationContext.Provider value={useMemo(() => ({
            notifications: visibleNotifications,
            allNotifications: notifications,
            unreadCount,
            channelUnreadCounts,
            prefs,
            soundEnabled,
            markRead,
            markAllRead,
            dismissNotification,
            addNotification,
            clearAll,
            setSoundEnabled,
            updateChannelPref,
            updateConsent,
            updateCategoryPref,
            updateSubtypePref,
            updateFrequencyPref,
            resetPrefs,
        }), [visibleNotifications, notifications, unreadCount, channelUnreadCounts, prefs,
            soundEnabled, markRead, markAllRead, dismissNotification, addNotification, clearAll,
            setSoundEnabled, updateChannelPref, updateConsent, updateCategoryPref, updateSubtypePref,
            updateFrequencyPref, resetPrefs])}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
};

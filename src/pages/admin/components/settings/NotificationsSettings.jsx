import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import api from '../../../../lib/api';
import { useNotifications } from '../../../../context/NotificationContext';

const Toggle = ({ checked, onChange, disabled }) => (
    <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

const NotificationsSettings = () => {
    const { soundEnabled, setSoundEnabled } = useNotifications();

    const [settings, setSettings] = useState({ email_enabled: true, whatsapp_enabled: true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Broadcast state
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);
    const [confirmBroadcast, setConfirmBroadcast] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/settings/notifications');
            if (data.settings) setSettings(data.settings);
        } catch (err) {
            showToast('error', 'Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            await api.put('/admin/settings/notifications', { settings });
            showToast('success', 'Notification settings saved');
        } catch (err) {
            showToast('error', err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            showToast('error', 'Title and message are required');
            return;
        }
        try {
            setBroadcasting(true);
            const data = await api.post('/admin/notifications/broadcast', {
                title: broadcastTitle,
                message: broadcastMessage
            });
            showToast('success', data.message || 'Broadcast sent successfully');
            setBroadcastTitle('');
            setBroadcastMessage('');
            setConfirmBroadcast(false);
        } catch (err) {
            showToast('error', err.message || 'Failed to send broadcast');
        } finally {
            setBroadcasting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Loading notification settings…</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* Broadcast Message — FIRST */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Send size={18} className="text-indigo-500" />
                        <h3 className="text-base font-bold text-gray-900">Broadcast Message</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Send a notification to all active users on the platform</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. System Maintenance Scheduled"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                            Message
                        </label>
                        <textarea
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Write your broadcast message here…"
                        />
                    </div>

                    <div className="flex justify-end">
                        {confirmBroadcast ? (
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-amber-600 font-medium">Send to all users?</p>
                                <button
                                    onClick={() => setConfirmBroadcast(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBroadcast}
                                    disabled={broadcasting}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {broadcasting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    {broadcasting ? 'Sending…' : 'Send Now'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
                                        showToast('error', 'Title and message are required');
                                        return;
                                    }
                                    setConfirmBroadcast(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                <Send size={16} /> Send Broadcast
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* Notification Channels — SECOND */}
            {/* ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Notification Channels</h3>
                    <p className="text-sm text-gray-500 mt-1">Control which notification channels are active platform-wide</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {/* Notification Sound */}
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                                {soundEnabled
                                    ? <Volume2 size={22} className="text-violet-600" />
                                    : <VolumeX size={22} className="text-gray-400" />
                                }
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Notification Sound</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Play a sound when a new notification arrives
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={soundEnabled}
                            onChange={(val) => setSoundEnabled(val)}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Mail size={22} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Send transactional and marketing emails to users
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={settings.email_enabled}
                            onChange={(val) => setSettings(prev => ({ ...prev, email_enabled: val }))}
                        />
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <MessageSquare size={22} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">WhatsApp Notifications</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Send WhatsApp messages for alerts and reminders
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={settings.whatsapp_enabled}
                            onChange={(val) => setSettings(prev => ({ ...prev, whatsapp_enabled: val }))}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsSettings;

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, TrendingUp, Users, CreditCard, ShieldAlert, Clock, Save } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useNotifications } from '../../../context/NotificationContext';
import { useToast } from '../../../components/ui/Toast';

/* ── Toggle (matches Integrations badge sizing) ────────────────────── */
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

/* ── Section Header (inside a Card) ────────────────────────────────── */
const SectionHeader = ({ title, description }) => (
    <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
const NotificationsTab = () => {
    const { prefs, updateChannelPref, updateCategoryPref, updateFrequencyPref } = useNotifications();
    const { showToast } = useToast();

    const [settings, setSettings] = useState({
        channels: {
            in_app: prefs.channels.in_app ?? true,
            email: true,
            sms: prefs.channels.sms ?? false,
            whatsapp: prefs.channels.whatsapp ?? false,
        },
        categories: {
            campaigns: prefs.categories.campaign?.enabled ?? true,
            leads: true,
            billing: prefs.categories.billing?.enabled ?? true,
            system: prefs.categories.system?.enabled ?? true,
        },
        deliveryMode: prefs.frequency.batch_normal ? 'daily' : 'instant',
        creditAlert: '50',
        quietHours: {
            start: prefs.frequency.quiet_start || '22:00',
            end: prefs.frequency.quiet_end || '08:00',
            allowCritical: prefs.frequency.quiet_hours_enabled ?? false,
        },
    });

    const updateChannel = (key) => setSettings(p => ({ ...p, channels: { ...p.channels, [key]: !p.channels[key] } }));
    const updateCategory = (key) => setSettings(p => ({ ...p, categories: { ...p.categories, [key]: !p.categories[key] } }));
    const updateDeliveryMode = (mode) => setSettings(p => ({ ...p, deliveryMode: mode }));
    const updateCreditAlert = (val) => setSettings(p => ({ ...p, creditAlert: val }));
    const updateQuietHours = (key, val) => setSettings(p => ({ ...p, quietHours: { ...p.quietHours, [key]: val } }));

    const handleSave = () => {
        updateChannelPref('in_app', settings.channels.in_app);
        updateChannelPref('sms', settings.channels.sms);
        updateChannelPref('whatsapp', settings.channels.whatsapp);
        updateCategoryPref('campaign', settings.categories.campaigns);
        updateCategoryPref('billing', settings.categories.billing);
        updateCategoryPref('system', settings.categories.system);
        updateFrequencyPref('batch_normal', settings.deliveryMode === 'daily');
        updateFrequencyPref('quiet_start', settings.quietHours.start);
        updateFrequencyPref('quiet_end', settings.quietHours.end);
        updateFrequencyPref('quiet_hours_enabled', settings.quietHours.allowCritical);
        showToast({ title: 'Settings saved', description: 'Your notification preferences have been updated.', variant: 'success', duration: 3000 });
    };

    /* ── Config arrays ─────────────────────────────────────────────────── */
    const channelItems = [
        { key: 'in_app', icon: Bell, label: 'In-App Notifications', desc: 'Get notified directly inside SalesPal' },
        { key: 'email', icon: Mail, label: 'Email Notifications', desc: 'Receive updates in your inbox' },
        { key: 'sms', icon: Smartphone, label: 'SMS Notifications', desc: 'Get text messages for important alerts' },
        { key: 'whatsapp', icon: MessageSquare, label: 'WhatsApp Notifications', desc: 'Receive alerts via WhatsApp' },
    ];

    const categoryItems = [
        { key: 'campaigns', icon: TrendingUp, label: 'Campaigns', desc: 'Campaign performance and updates' },
        { key: 'leads', icon: Users, label: 'Leads & Sales', desc: 'New leads and status updates' },
        { key: 'billing', icon: CreditCard, label: 'Billing & Credits', desc: 'Low balance and payment alerts' },
        { key: 'system', icon: ShieldAlert, label: 'System Alerts', desc: 'Security issues and errors' },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">

            {/* ── SECTION 1: Channels ────────────────────────────────────── */}
            <Card className="divide-y divide-gray-100 overflow-hidden shadow-sm border border-gray-200" noPadding>
                <SectionHeader title="Channels" description="Choose how you want to receive notifications" />
                {channelItems.map(item => (
                    <div key={item.key} className="p-6 flex items-center gap-6 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 text-gray-700 shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900">{item.label}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="shrink-0">
                            <Toggle checked={settings.channels[item.key]} onChange={() => updateChannel(item.key)} />
                        </div>
                    </div>
                ))}
            </Card>

            {/* ── SECTION 2: Categories ──────────────────────────────────── */}
            <Card className="divide-y divide-gray-100 overflow-hidden shadow-sm border border-gray-200" noPadding>
                <SectionHeader title="What do you want to be notified about?" description="Toggle notification categories on or off" />
                {categoryItems.map(item => (
                    <div key={item.key} className="p-6 flex items-center gap-6 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 text-blue-600 shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900">{item.label}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="shrink-0">
                            <Toggle checked={settings.categories[item.key]} onChange={() => updateCategory(item.key)} />
                        </div>
                    </div>
                ))}
            </Card>

            {/* ── SECTION 3: Delivery Mode ───────────────────────────────── */}
            <Card className="overflow-hidden shadow-sm border border-gray-200" noPadding>
                <SectionHeader title="Delivery Mode" description="Choose how frequently you receive notifications" />
                <div className="p-6 space-y-3">
                    {[
                        { value: 'instant', label: 'Instant', sublabel: '(recommended)' },
                        { value: 'daily', label: 'Daily Summary', sublabel: null },
                    ].map(opt => (
                        <label
                            key={opt.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${settings.deliveryMode === opt.value
                                ? 'border-blue-200 bg-blue-50/60 ring-1 ring-blue-100'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input
                                type="radio"
                                name="deliveryMode"
                                value={opt.value}
                                checked={settings.deliveryMode === opt.value}
                                onChange={() => updateDeliveryMode(opt.value)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                            {opt.sublabel && <span className="text-xs text-gray-500">{opt.sublabel}</span>}
                        </label>
                    ))}
                </div>
            </Card>

            {/* ── SECTION 4: Credit Alerts ───────────────────────────────── */}
            <Card className="overflow-hidden shadow-sm border border-gray-200" noPadding>
                <SectionHeader title="Credit Alerts" description="Notify me when credits fall below" />
                <div className="p-6 flex flex-wrap gap-3">
                    {['50', '30', '10'].map(val => (
                        <label
                            key={val}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border cursor-pointer transition-all ${settings.creditAlert === val
                                ? 'border-blue-200 bg-blue-50/60 ring-1 ring-blue-100'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                            <input
                                type="radio"
                                name="creditAlert"
                                value={val}
                                checked={settings.creditAlert === val}
                                onChange={() => updateCreditAlert(val)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-gray-900">{val}%</span>
                        </label>
                    ))}
                </div>
            </Card>

            {/* ── SECTION 5: Quiet Hours ─────────────────────────────────── */}
            <Card className="divide-y divide-gray-100 overflow-hidden shadow-sm border border-gray-200" noPadding>
                <SectionHeader title="Quiet Hours" description="Pause non-critical notifications during specific hours" />
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Start Time</label>
                            <input
                                type="time"
                                value={settings.quietHours.start}
                                onChange={(e) => updateQuietHours('start', e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">End Time</label>
                            <input
                                type="time"
                                value={settings.quietHours.end}
                                onChange={(e) => updateQuietHours('end', e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Allow critical alerts during quiet hours</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Important notifications will still come through</p>
                    </div>
                    <div className="shrink-0">
                        <Toggle checked={settings.quietHours.allowCritical} onChange={() => updateQuietHours('allowCritical', !settings.quietHours.allowCritical)} />
                    </div>
                </div>
            </Card>

            {/* ── Save Button ────────────────────────────────────────────── */}
            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

export default NotificationsTab;

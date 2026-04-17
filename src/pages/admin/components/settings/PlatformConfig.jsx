import React, { useState, useEffect } from 'react';
import { Settings, Megaphone, Phone, UserCheck, Headphones, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
import { usePricing } from '../../../../context/PricingContext';
import { useMaintenance } from '../../../../context/MaintenanceContext';
import MaintenanceSettingsPanel from '../../../../components/maintenance/MaintenanceSettingsPanel';

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

const moduleConfig = [
    { id: 'marketing', label: 'Marketing', description: 'AI-powered ad campaigns & creative generation', icon: Megaphone, color: 'blue' },
    { id: 'sales', label: 'Sales', description: 'AI calling, WhatsApp automation & lead management', icon: Phone, color: 'green' },
    { id: 'post-sales', label: 'Post-Sales', description: 'Customer success, onboarding & payment follow-ups', icon: UserCheck, color: 'purple' },
    { id: 'support', label: 'Support', description: '24/7 AI-powered customer support & ticketing', icon: Headphones, color: 'orange' },
];

const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
};

const PlatformConfig = () => {
    const { fetchPricing } = usePricing();
    const { refreshStatus } = useMaintenance();
    const [config, setConfig] = useState({
        modules: { marketing: true, sales: true, 'post-sales': true, support: true },
        maintenance: {
            global: { enabled: false, reason: '', eta: '', scheduled_start: '', scheduled_end: '', notify_users: false },
            modules: {
                marketing: { enabled: false, reason: '', eta: '' },
                sales: { enabled: false, reason: '', eta: '' },
                'post-sales': { enabled: false, reason: '', eta: '' },
                support: { enabled: false, reason: '', eta: '' },
            },
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/settings/platform');
            if (data.config) {
                setConfig(prev => ({
                    ...prev,
                    ...data.config,
                    maintenance: {
                        global: { ...prev.maintenance.global, ...(data.config.maintenance?.global || {}) },
                        modules: {
                            ...prev.maintenance.modules,
                            ...(data.config.maintenance?.modules || {}),
                        },
                    },
                }));
            }
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load platform config' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/admin/settings/platform', { config });
            await fetchPricing(true);
            // Immediately refresh maintenance status so guards activate instantly
            await refreshStatus();
            setToast({ type: 'success', message: 'Platform config saved successfully' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save config' });
        } finally {
            setSaving(false);
        }
    };

    const updateModule = (moduleId, enabled) => {
        setConfig(prev => ({
            ...prev,
            modules: { ...prev.modules, [moduleId]: enabled }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Loading platform config…</span>
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

            {/* Module Toggles */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Module Access</h3>
                        <p className="text-sm text-gray-500 mt-1">Enable or disable platform modules globally</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moduleConfig.map(mod => {
                        const Icon = mod.icon;
                        const colors = colorMap[mod.color];
                        return (
                            <div key={mod.id} className={`border ${colors.border} rounded-xl p-4 ${colors.bg} transition-all`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                            <Icon size={20} className={colors.icon} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{mod.label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{mod.description}</p>
                                        </div>
                                    </div>
                                    <Toggle
                                        checked={config.modules[mod.id] ?? true}
                                        onChange={(val) => updateModule(mod.id, val)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Maintenance Mode — Rich Panel */}
            <MaintenanceSettingsPanel
                config={config}
                setConfig={setConfig}
                onSave={handleSave}
                saving={saving}
            />
        </div>
    );
};

export default PlatformConfig;

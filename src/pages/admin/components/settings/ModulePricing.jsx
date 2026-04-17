import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Check, Loader2, AlertTriangle, Megaphone, Phone, UserCheck, Headphones, Layers } from 'lucide-react';
import api from '../../../../lib/api';

const Toggle = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

const moduleDefinitions = [
    {
        id: 'salespal-360',
        name: 'SalesPal 360',
        subtitle: 'Complete AI Revenue Operating System',
        icon: Layers,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        isBundled: true,
        features: [
            'All 4 products included', 'One shared AI memory', '2200 AI calling minutes / month',
            'Owner control center', '2200 WhatsApp conversations / month', 'Role-based access'
        ],
    },
    {
        id: 'marketing',
        name: 'Marketing',
        subtitle: 'AI-Powered Ad Campaigns',
        icon: Megaphone,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        features: [
            '20 AI image creatives / month', '4 AI videos (≥30 sec) / month',
            '6 AI carousel creatives / month', '30 scheduled posts / month',
            'AI ad copy & captions', 'Multi-platform publishing'
        ],
    },
    {
        id: 'sales',
        name: 'Sales',
        subtitle: 'Human-like Conversations',
        icon: Phone,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        features: [
            '1000 AI calling minutes / month', '1000 WhatsApp conversations / month',
            'AI outbound & inbound calling', 'AI WhatsApp replies',
            'Follow-up & re-scheduling logic', 'Context memory'
        ],
    },
    {
        id: 'post-sales',
        name: 'Post-Sales',
        subtitle: 'Automated Customer Success',
        icon: UserCheck,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        features: [
            '1000 AI calling minutes / month', '1000 WhatsApp conversations / month',
            'Automated payment reminders', 'Payment proof collection',
            'Owner verified closure', 'Document checklist & re-upload'
        ],
    },
    {
        id: 'support',
        name: 'Support',
        subtitle: '24/7 AI Support',
        icon: Headphones,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        features: [
            '1000 AI calling minutes / month', '1000 WhatsApp conversations / month',
            'AI answers from your knowledge', 'No hallucination logic',
            'Complaint registration ID', 'Sentiment detection'
        ],
    }
];

const ModulePricing = () => {
    const [pricing, setPricing] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            setLoading(true);
            const data = await api.get('/admin/module-pricing');
            if (data.pricing) setPricing(data.pricing);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load pricing data' });
        } finally {
            setLoading(false);
        }
    };

    const updatePrice = (moduleId, field, value) => {
        setPricing(prev => ({
            ...prev,
            [moduleId]: {
                ...prev[moduleId],
                [field]: field === 'enabled' ? value : (parseInt(value) || 0)
            }
        }));
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            const promises = Object.entries(pricing).map(([moduleId, data]) =>
                api.put(`/admin/module-pricing/${moduleId}`, data)
            );
            await Promise.all(promises);
            setToast({ type: 'success', message: 'All pricing updated successfully' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ type: 'error', message: err.message || 'Failed to save pricing' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="ml-2 text-gray-500">Loading pricing…</span>
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

            {/* Header with save button */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Module Pricing</h3>
                        <p className="text-sm text-gray-500 mt-1">Set subscription pricing for each module. Changes affect the entire platform.</p>
                    </div>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                            saving ? 'bg-gray-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {saving ? (
                            <><Loader2 size={16} className="animate-spin" /> Saving…</>
                        ) : (
                            <><Save size={16} /> Save All Changes</>
                        )}
                    </button>
                </div>

                {/* Pricing Cards */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {moduleDefinitions.map((mod) => {
                        const Icon = mod.icon;
                        const modPricing = pricing[mod.id] || { monthly: 0, yearly: 0, enabled: true };

                        return (
                            <div
                                key={mod.id}
                                className={`border-2 rounded-2xl p-6 transition-all ${
                                    modPricing.enabled
                                        ? 'bg-white border-gray-200 hover:border-blue-300'
                                        : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className={`w-12 h-12 ${mod.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                            <Icon size={22} className={mod.iconColor} />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">{mod.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">{mod.subtitle}</p>
                                    </div>
                                    <Toggle
                                        checked={modPricing.enabled ?? true}
                                        onChange={(val) => updatePrice(mod.id, 'enabled', val)}
                                    />
                                </div>

                                {/* Price Inputs */}
                                <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                                            Monthly Price (₹)
                                        </label>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={modPricing.monthly || ''}
                                                onChange={(e) => updatePrice(mod.id, 'monthly', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                            <span className="text-gray-500 font-medium">/mo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Features</p>
                                    <ul className="space-y-2">
                                        {mod.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <Check size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModulePricing;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageCircle, Mail, PhoneCall, Smartphone, ArrowLeft, Check, Plus } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import { useLocation, useNavigate } from 'react-router-dom';

const formatCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

const REMINDER_TYPES = [
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5 text-emerald-500" />, color: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50', iconBg: 'bg-emerald-100' },
    { id: 'sms', name: 'SMS', icon: <Smartphone className="w-5 h-5 text-blue-500" />, color: 'peer-checked:border-blue-500 peer-checked:bg-blue-50', iconBg: 'bg-blue-100' },
    { id: 'email', name: 'Email', icon: <Mail className="w-5 h-5 text-violet-500" />, color: 'peer-checked:border-violet-500 peer-checked:bg-violet-50', iconBg: 'bg-violet-100' },
    { id: 'ai_call', name: 'AI Call', icon: <PhoneCall className="w-5 h-5 text-indigo-500" />, color: 'peer-checked:border-indigo-500 peer-checked:bg-indigo-50', iconBg: 'bg-indigo-100' },
];

const TIMING_OPTIONS = [
    { id: '1_day_before', label: '1 day before due date' },
    { id: 'on_due_date', label: 'On due date' },
    { id: '3_days_after', label: '3 days after due date' },
    { id: 'custom', label: 'Custom schedule' }
];

const Automations = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addAutomation, getCustomerAutomations, toggleAutomation } = usePostSales();

    // Selected customer data from Router state
    const customerData = location.state || null;

    const [channel, setChannel] = useState('whatsapp');
    const [timing, setTiming] = useState('1_day_before');
    const [saved, setSaved] = useState(false);

    // If we came directly (no state), show empty/selection state or generic library
    // In the real app, we'd probably have a customer selector here if state is null.
    // For the assignment, we focus on the specific customer view as requested.

    const activeAutomations = customerData ? getCustomerAutomations(customerData.customerId) : [];

    const handleSave = () => {
        if (!customerData) return;

        addAutomation({
            customerId: customerData.customerId,
            trigger: 'manual_setup',
            action: `send_${channel}`,
            condition: timing
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!customerData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <Zap className="w-12 h-12 text-indigo-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Customer First</h2>
                <p className="text-gray-500 mb-6 max-w-sm">To configure specific automations, click the bell icon next to a customer in the Post-Sales Dashboard.</p>
                <button onClick={() => navigate('/post-sales')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700">
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-indigo-500" /> Follow-up Automations
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Configure automated reminders for this customer</p>
                </div>
            </div>

            {/* Customer Context Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Customer</p>
                        <p className="text-xl font-bold">{customerData.customerName}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Remaining Amount</p>
                        <p className="text-xl font-bold text-emerald-400">{formatCurrency(customerData.remainingAmount)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Due Date</p>
                        <p className="text-xl font-bold text-amber-300">{formatDate(customerData.dueDate)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">

                        {/* Type */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">1. Reminder Type</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {REMINDER_TYPES.map(type => (
                                    <label key={type.id} className="cursor-pointer relative">
                                        <input type="radio" name="channel" value={type.id} className="peer sr-only"
                                            checked={channel === type.id} onChange={() => setChannel(type.id)} />
                                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-gray-100 transition-all ${type.color}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${type.iconBg}`}>
                                                {type.icon}
                                            </div>
                                            <span className={`text-xs font-bold ${channel === type.id ? 'text-gray-900' : 'text-gray-500'}`}>{type.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Timing */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">2. Reminder Timing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {TIMING_OPTIONS.map(opt => (
                                    <label key={opt.id} className="cursor-pointer flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition-colors peer-checked:border-indigo-500">
                                        <div className="relative flex items-center justify-center w-5 h-5">
                                            <input type="radio" name="timing" value={opt.id} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-indigo-600 transition-colors cursor-pointer"
                                                checked={timing === opt.id} onChange={() => setTiming(opt.id)} />
                                            {timing === opt.id && <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full pointer-events-none" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Save */}
                        <div className="pt-2">
                            <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                                {saved ? <><Check className="w-5 h-5" /> Saved Successfully</> : <><Plus className="w-5 h-5" /> Add Automation Rule</>}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Active Rules Column */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 h-fit">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Active Rules</h3>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {activeAutomations.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No active rules for this customer.</p>
                            ) : activeAutomations.map((rule, i) => (
                                <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 capitalize">{rule.action.replace('send_', '')} Reminder</p>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{rule.condition.replace(/_/g, ' ')}</p>
                                    </div>
                                    {/* Toggle */}
                                    <button onClick={() => toggleAutomation(rule.id)}
                                        className={`relative w-8 h-4.5 rounded-full transition-colors shrink-0 ${rule.active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                        style={{ height: '20px', width: '36px' }}>
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${rule.active ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Automations;

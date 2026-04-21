import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, CheckCircle2, Save } from 'lucide-react';

const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'AI Call'];
const TRIGGERS = ['1 day before due date', 'On due date', '3 days after due date', 'Custom'];
const ACTIONS = ['Send Reminder Message', 'Create Follow-up Task', 'Request Payment Confirmation'];

const AutomationForm = ({ customerContext, onSave }) => {
    const [channel, setChannel] = useState(CHANNELS[0]);
    const [trigger, setTrigger] = useState(TRIGGERS[0]);
    const [action, setAction] = useState(ACTIONS[0]);
    const [customDate, setCustomDate] = useState('');
    const [customTime, setCustomTime] = useState('');

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        const newAutomation = {
            id: crypto.randomUUID(),
            customerId: customerContext?.id || 'all',
            channel,
            trigger,
            action,
            customSchedule: trigger === 'Custom' ? { date: customDate, time: customTime || null } : null,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem('salespal_postsales_automations') || '[]');
        const updated = [newAutomation, ...existing];
        localStorage.setItem('salespal_postsales_automations', JSON.stringify(updated));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        if (onSave) onSave(newAutomation);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group relative"
        >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Settings className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">New Automation Rule</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Configure when and how to follow up</p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Channel */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">Channel</label>
                        <select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm text-slate-700"
                        >
                            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Trigger */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">Trigger Timing</label>
                        <select
                            value={trigger}
                            onChange={(e) => setTrigger(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm text-slate-700"
                        >
                            {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {trigger === 'Custom' && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                                />
                                <input
                                    type="time"
                                    value={customTime}
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">Action Type</label>
                        <select
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors text-sm text-slate-700"
                        >
                            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-end gap-3">
                {showSuccess && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Saved!
                    </motion.div>
                )}
                <button
                    onClick={handleSave}
                    disabled={trigger === 'Custom' && !customDate}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors relative overflow-hidden"
                >
                    <Save className="w-4 h-4" /> Save Automation
                </button>
            </div>
        </motion.div>
    );
};

export default AutomationForm;

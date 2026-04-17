import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PhoneCall, MessageSquare, Zap, Clock, Database, Bell, BrainCircuit,
    ChevronDown, ChevronUp, Save, RotateCcw, Info, Check
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

/* ─── Toggle (identical to NotificationsTab) ─────────────────── */
const Toggle = ({ checked, onChange, disabled = false, size = 'md' }) => {
    const h = size === 'sm' ? 'h-4 w-8' : 'h-5 w-10';
    const thumb = size === 'sm'
        ? 'after:h-3 after:w-3 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-4'
        : 'after:h-4 after:w-4 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-5';
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" disabled={disabled} />
            <div className={`${h} ${thumb} bg-gray-200 rounded-full peer transition-colors peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:transition-all`} />
        </label>
    );
};

/* ─── AccordionSection (identical pattern to NotificationsTab) ── */
const AccordionSection = ({ icon: Icon, title, expanded, onToggle, children }) => (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 bg-white ${expanded ? 'border-blue-200 shadow-md ring-1 ring-blue-50' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'}`}>
        <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none group" onClick={onToggle}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${expanded ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{title}</p>
            </div>
            {expanded
                ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />}
        </div>
        <AnimatePresence initial={false}>
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="border-t border-gray-100 bg-gray-50/50"
                >
                    <div className="p-5">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

/* ─── Row helpers ─────────────────────────────────────────────── */
const SettingRow = ({ label, desc, children }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all gap-4">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        <div className="shrink-0">{children}</div>
    </div>
);

const FieldLabel = ({ children }) => (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{children}</label>
);

const StyledSelect = ({ value, onChange, children, className = '' }) => (
    <select value={value} onChange={onChange}
        className={`text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}>
        {children}
    </select>
);

const StyledInput = ({ type = 'text', value, onChange, placeholder, className = '' }) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`} />
);

/* ─── Scoring factor row ──────────────────────────────────────── */
const ScoreFactor = ({ label, value, color }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-all">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value > 0 ? `+${value}` : value}</span>
    </div>
);

/* ─── Follow-up sequence step ────────────────────────────────── */
const SequenceStep = ({ day, action, icon: Icon, color }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${color}`}>
            Day {day}
        </div>
        <div className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${color} bg-opacity-10`}>
            <Icon size={14} />
        </div>
        <p className="text-sm font-medium text-gray-700">{action}</p>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const SalesSettings = () => {
    const { showToast } = useToast();
    const [openSection, setOpenSection] = useState('calling');

    const toggle = (id) => setOpenSection(prev => prev === id ? null : id);
    const save = (msg = 'Settings saved') =>
        showToast({ title: msg, description: 'Preferences updated successfully.', variant: 'success', duration: 2500 });

    /* ── AI Calling ── */
    const [callStart, setCallStart] = useState('09:00');
    const [callEnd, setCallEnd] = useState('21:00');
    const [aiAnswering, setAiAnswering] = useState(true);
    const [missedCallback, setMissedCallback] = useState(true);
    const [callbackDelay, setCallbackDelay] = useState('5');
    const [maxAttempts, setMaxAttempts] = useState('3');
    const [retryInterval, setRetryInterval] = useState('60');
    const [callRecording, setCallRecording] = useState(true);
    const [voicemailDetect, setVoicemailDetect] = useState(true);

    /* ── WhatsApp ── */
    const [waEnabled, setWaEnabled] = useState(true);
    const [wa24x7, setWa24x7] = useState(true);
    const [waBrochure, setWaBrochure] = useState(true);
    const [waPricing, setWaPricing] = useState(false);
    const [waMeetingLink, setWaMeetingLink] = useState(true);
    const [waReplyDelay, setWaReplyDelay] = useState('Instant');
    const [waFollowUpDelay, setWaFollowUpDelay] = useState('24 Hours');

    /* ── Lead Scoring ── */
    const [hotMin, setHotMin] = useState(80);
    const [warmMin, setWarmMin] = useState(50);

    /* ── Follow-up ── */
    const [fuEnabled, setFuEnabled] = useState(true);
    const [fuMaxPerLead, setFuMaxPerLead] = useState('7');
    const [stopAfterConv, setStopAfterConv] = useState(true);
    const [pauseOnMeeting, setPauseOnMeeting] = useState(true);

    /* ── Lead Sources ── */
    const [sources, setSources] = useState({
        salespal: { label: 'SalesPal Marketing', connected: true, autoAssign: true, autoCalling: true, autoWA: true },
        meta: { label: 'Meta Ads', connected: true, autoAssign: true, autoCalling: true, autoWA: true },
        google: { label: 'Google Ads', connected: false, autoAssign: false, autoCalling: false, autoWA: false },
        website: { label: 'Website', connected: true, autoAssign: true, autoCalling: false, autoWA: true },
        whatsapp: { label: 'WhatsApp', connected: true, autoAssign: true, autoCalling: false, autoWA: false },
        manual: { label: 'Manual Entry', connected: true, autoAssign: false, autoCalling: false, autoWA: false },
        csv: { label: 'CSV Upload', connected: true, autoAssign: false, autoCalling: false, autoWA: false },
    });

    const toggleSource = (key, field) => setSources(prev => ({
        ...prev,
        [key]: { ...prev[key], [field]: !prev[key][field] }
    }));

    /* ── Sales Notifications ── */
    const [alerts, setAlerts] = useState({
        hotLead: { label: 'Hot Lead Alert', channels: { inapp: true, email: true, sms: true, wa: false } },
        followup: { label: 'Follow-up Reminder', channels: { inapp: true, email: true, sms: false, wa: false } },
        dealClosed: { label: 'Deal Closed', channels: { inapp: true, email: true, sms: true, wa: true } },
        missedCall: { label: 'Missed Call Alert', channels: { inapp: true, email: false, sms: true, wa: true } },
        inactivity: { label: 'Lead Inactivity Alert', channels: { inapp: true, email: true, sms: false, wa: false } },
    });

    const toggleAlert = (alertKey, ch) => setAlerts(prev => ({
        ...prev,
        [alertKey]: {
            ...prev[alertKey],
            channels: { ...prev[alertKey].channels, [ch]: !prev[alertKey].channels[ch] }
        }
    }));

    /* ── AI Behavior ── */
    const [aiLang, setAiLang] = useState('English');
    const [aiGreeting, setAiGreeting] = useState('Hi {name}, this is an AI assistant calling on behalf of {company}. I understand you were interested in {project}. Is this a good time to talk?');
    const [aiTone, setAiTone] = useState('Professional');

    const CHANNELS = [
        { key: 'inapp', label: 'In-App' },
        { key: 'email', label: 'Email' },
        { key: 'sms', label: 'SMS' },
        { key: 'wa', label: 'WhatsApp' },
    ];

    /* ─────────────────────── RENDER ───────────────────────────── */
    return (
        <div className="max-w-[1400px] mx-auto pb-10 w-full animate-fade-in-up">
            <div className="bg-gray-50/40 p-5 sm:p-6 lg:p-8 rounded-3xl border border-gray-100/60 space-y-6">

                {/* ── 1. AI Calling Settings ── */}
                <AccordionSection icon={PhoneCall} title="AI Calling Settings" expanded={openSection === 'calling'} onToggle={() => toggle('calling')}>
                    <div className="space-y-5">
                        {/* Outbound Window */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Outbound Calling Window</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                    <FieldLabel>Start Time</FieldLabel>
                                    <StyledInput type="time" value={callStart} onChange={e => setCallStart(e.target.value)} className="w-full" />
                                </div>
                                <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                    <FieldLabel>End Time</FieldLabel>
                                    <StyledInput type="time" value={callEnd} onChange={e => setCallEnd(e.target.value)} className="w-full" />
                                </div>
                            </div>
                        </div>

                        {/* Inbound Handling */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Inbound Call Handling</p>
                            <div className="space-y-3">
                                <SettingRow label="Enable AI call answering" desc="AI handles inbound calls 24/7">
                                    <Toggle checked={aiAnswering} onChange={() => setAiAnswering(v => !v)} />
                                </SettingRow>
                                <SettingRow label="Enable missed call callback" desc="AI auto-calls back missed leads">
                                    <Toggle checked={missedCallback} onChange={() => setMissedCallback(v => !v)} />
                                </SettingRow>
                                <SettingRow label="Callback delay (minutes)" desc="Wait before placing the callback">
                                    <StyledSelect value={callbackDelay} onChange={e => setCallbackDelay(e.target.value)}>
                                        {['1', '2', '5', '10', '15', '30'].map(v => <option key={v} value={v}>{v} min</option>)}
                                    </StyledSelect>
                                </SettingRow>
                            </div>
                        </div>

                        {/* Call Rules */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Call Rules</p>
                            <div className="space-y-3">
                                <SettingRow label="Max call attempts per lead">
                                    <StyledSelect value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)}>
                                        {['1', '2', '3', '4', '5', '6'].map(v => <option key={v} value={v}>{v} attempts</option>)}
                                    </StyledSelect>
                                </SettingRow>
                                <SettingRow label="Retry interval">
                                    <StyledSelect value={retryInterval} onChange={e => setRetryInterval(e.target.value)}>
                                        {['30', '60', '120', '240', '480', '1440'].map(v => <option key={v} value={v}>{v < 60 ? `${v} min` : `${v / 60} hr`}</option>)}
                                    </StyledSelect>
                                </SettingRow>
                                <SettingRow label="Enable call recording" desc="Record all AI-assisted calls">
                                    <Toggle checked={callRecording} onChange={() => setCallRecording(v => !v)} />
                                </SettingRow>
                                <SettingRow label="Voicemail detection" desc="Detect and skip voicemails">
                                    <Toggle checked={voicemailDetect} onChange={() => setVoicemailDetect(v => !v)} />
                                </SettingRow>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* ── 2. WhatsApp Automation ── */}
                <AccordionSection icon={MessageSquare} title="WhatsApp Automation" expanded={openSection === 'whatsapp'} onToggle={() => toggle('whatsapp')}>
                    <div className="space-y-5">
                        <div className="space-y-3">
                            <SettingRow label="Enable WhatsApp AI" desc="Activate AI-powered WhatsApp responses">
                                <Toggle checked={waEnabled} onChange={() => setWaEnabled(v => !v)} />
                            </SettingRow>
                            <SettingRow label="Enable 24×7 response" desc="Respond outside business hours">
                                <Toggle checked={wa24x7} onChange={() => setWa24x7(v => !v)} disabled={!waEnabled} />
                            </SettingRow>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Auto-Send Content</p>
                            <div className="space-y-3">
                                <SettingRow label="Auto send brochure" desc="Send project brochure on first contact">
                                    <Toggle checked={waBrochure} onChange={() => setWaBrochure(v => !v)} disabled={!waEnabled} />
                                </SettingRow>
                                <SettingRow label="Auto send pricing" desc="Attach pricing sheet when requested">
                                    <Toggle checked={waPricing} onChange={() => setWaPricing(v => !v)} disabled={!waEnabled} />
                                </SettingRow>
                                <SettingRow label="Auto send meeting link" desc="Share calendar link to warm leads">
                                    <Toggle checked={waMeetingLink} onChange={() => setWaMeetingLink(v => !v)} disabled={!waEnabled} />
                                </SettingRow>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Message Automation Delays</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                    <FieldLabel>Auto Reply Delay</FieldLabel>
                                    <StyledSelect value={waReplyDelay} onChange={e => setWaReplyDelay(e.target.value)} className="w-full">
                                        {['Instant', '30 Seconds', '1 Minute', '5 Minutes', '15 Minutes'].map(v => <option key={v}>{v}</option>)}
                                    </StyledSelect>
                                </div>
                                <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                    <FieldLabel>Follow-up Message Delay</FieldLabel>
                                    <StyledSelect value={waFollowUpDelay} onChange={e => setWaFollowUpDelay(e.target.value)} className="w-full">
                                        {['1 Hour', '4 Hours', '12 Hours', '24 Hours', '48 Hours'].map(v => <option key={v}>{v}</option>)}
                                    </StyledSelect>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* ── 3. Lead Scoring Rules ── */}
                <AccordionSection icon={Zap} title="Lead Scoring Rules" expanded={openSection === 'scoring'} onToggle={() => toggle('scoring')}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Factors */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Scoring Factors</p>
                            <div className="space-y-2">
                                <ScoreFactor label="Requested site visit" value={40} color="text-emerald-600" />
                                <ScoreFactor label="Price discussion" value={30} color="text-emerald-600" />
                                <ScoreFactor label="Multiple interactions" value={20} color="text-emerald-600" />
                                <ScoreFactor label="WhatsApp reply" value={10} color="text-emerald-600" />
                                <ScoreFactor label="No response" value={-15} color="text-red-500" />
                            </div>
                            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg mt-3">
                                Custom scoring factors available in Enterprise plan.
                            </p>
                        </div>

                        {/* Score Ranges */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Score Range Thresholds</p>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl border border-red-100 bg-red-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-red-700">🔥 Hot Lead</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StyledInput type="number" value={hotMin} onChange={e => setHotMin(Number(e.target.value))} className="w-20" />
                                        <span className="text-sm text-red-700 font-medium">– 100 points</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-orange-100 bg-orange-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-orange-700">🌡 Warm Lead</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StyledInput type="number" value={warmMin} onChange={e => setWarmMin(Number(e.target.value))} className="w-20" />
                                        <span className="text-sm text-orange-700 font-medium">– {hotMin - 1} points</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-sky-700">❄️ Cold Lead</span>
                                    </div>
                                    <p className="text-sm text-sky-700 font-medium">0 – {warmMin - 1} points</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* ── 4. Follow-up Automation ── */}
                <AccordionSection icon={Clock} title="Follow-up Automation" expanded={openSection === 'followups'} onToggle={() => toggle('followups')}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Controls */}
                        <div className="space-y-3">
                            <SettingRow label="Enable automation" desc="Auto-run follow-up sequences">
                                <Toggle checked={fuEnabled} onChange={() => setFuEnabled(v => !v)} />
                            </SettingRow>
                            <SettingRow label="Maximum follow-ups per lead">
                                <StyledSelect value={fuMaxPerLead} onChange={e => setFuMaxPerLead(e.target.value)} disabled={!fuEnabled}>
                                    {['3', '5', '7', '10', '14'].map(v => <option key={v} value={v}>{v} follow-ups</option>)}
                                </StyledSelect>
                            </SettingRow>
                            <SettingRow label="Stop after conversion" desc="Halt sequence when lead converts">
                                <Toggle checked={stopAfterConv} onChange={() => setStopAfterConv(v => !v)} disabled={!fuEnabled} />
                            </SettingRow>
                            <SettingRow label="Pause after meeting scheduled" desc="Prevent over-communication">
                                <Toggle checked={pauseOnMeeting} onChange={() => setPauseOnMeeting(v => !v)} disabled={!fuEnabled} />
                            </SettingRow>
                        </div>

                        {/* Sequence */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">Default Sequence</p>
                            <div className="space-y-2">
                                <SequenceStep day={1} action="AI Outbound Call" icon={PhoneCall} color="bg-blue-100 text-blue-700" />
                                <SequenceStep day={2} action="WhatsApp Message" icon={MessageSquare} color="bg-green-100 text-green-700" />
                                <SequenceStep day={4} action="Reminder Call" icon={PhoneCall} color="bg-indigo-100 text-indigo-700" />
                                <SequenceStep day={7} action="Final Follow-up Message" icon={MessageSquare} color="bg-orange-100 text-orange-700" />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Custom sequences available in Enterprise plan.</p>
                        </div>
                    </div>
                </AccordionSection>

                {/* ── 5. Lead Sources ── */}
                <AccordionSection icon={Database} title="Lead Sources" expanded={openSection === 'sources'} onToggle={() => toggle('sources')}>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 pb-3 border-b border-gray-100">Configure intake sources and their automation behaviour.</p>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.entries(sources).map(([key, src]) => (
                                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${src.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {src.connected ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800 truncate">{src.label}</span>
                                    </div>
                                    <div className="flex items-center gap-5 shrink-0">
                                        {[
                                            { field: 'autoAssign', label: 'Auto Assign' },
                                            { field: 'autoCalling', label: 'AI Call' },
                                            { field: 'autoWA', label: 'AI WhatsApp' },
                                        ].map(opt => (
                                            <label key={opt.field} className="flex flex-col items-center gap-1 cursor-pointer group">
                                                <Toggle checked={src[opt.field]} onChange={() => toggleSource(key, opt.field)} size="sm" />
                                                <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AccordionSection>

                {/* ── 6. Sales Notifications ── */}
                <AccordionSection icon={Bell} title="Sales Notifications" expanded={openSection === 'notifications'} onToggle={() => toggle('notifications')}>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 pb-3 border-b border-gray-100">Choose which alerts to receive and via which channels.</p>

                        {/* Header row */}
                        <div className="hidden sm:grid grid-cols-[1fr_repeat(4,60px)] gap-3 px-4">
                            <span />
                            {CHANNELS.map(ch => (
                                <span key={ch.key} className="text-[10px] font-bold uppercase text-gray-400 text-center">{ch.label}</span>
                            ))}
                        </div>

                        {Object.entries(alerts).map(([key, alert]) => (
                            <div key={key} className="grid grid-cols-1 sm:grid-cols-[1fr_repeat(4,60px)] items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                <span className="text-sm font-semibold text-gray-800">{alert.label}</span>
                                {CHANNELS.map(ch => (
                                    <div key={ch.key} className="flex flex-col items-center gap-1">
                                        <Toggle size="sm" checked={alert.channels[ch.key]} onChange={() => toggleAlert(key, ch.key)} />
                                        <span className="text-[10px] text-gray-400 sm:hidden">{ch.label}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                {/* ── 7. AI Behavior & Scripts ── */}
                <AccordionSection icon={BrainCircuit} title="AI Behavior & Scripts" expanded={openSection === 'behavior'} onToggle={() => toggle('behavior')}>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                <FieldLabel>Default Language</FieldLabel>
                                <StyledSelect value={aiLang} onChange={e => setAiLang(e.target.value)} className="w-full">
                                    {['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu'].map(l => <option key={l}>{l}</option>)}
                                </StyledSelect>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-white">
                                <FieldLabel>Sales Tone</FieldLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Friendly', 'Professional', 'Consultative', 'Aggressive'].map(tone => (
                                        <button key={tone} onClick={() => setAiTone(tone)}
                                            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${aiTone === tone ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100 bg-white">
                            <FieldLabel>Greeting Script</FieldLabel>
                            <p className="text-xs text-gray-500 mb-2">Use <code className="bg-gray-100 px-1 rounded">{'{name}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{company}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{project}'}</code> as placeholders.</p>
                            <textarea rows="4" value={aiGreeting} onChange={e => setAiGreeting(e.target.value)}
                                className="w-full text-sm border border-gray-200 bg-gray-50 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" />
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" strokeWidth={2} />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">AI Script Preview</p>
                                <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                                    "{aiGreeting.replace('{name}', 'Rahul').replace('{company}', 'SalesPal').replace('{project}', 'Prestige Towers')}"
                                </p>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

            </div>

            {/* Footer actions */}
            <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
                <button className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RotateCcw className="w-4 h-4" /> Reset to Defaults
                </button>
                <button onClick={() => save('Sales settings saved')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm">
                    <Save size={16} /> Save Settings
                </button>
            </div>
        </div>
    );
};

export default SalesSettings;

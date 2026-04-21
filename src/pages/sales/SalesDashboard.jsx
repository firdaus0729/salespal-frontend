import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Phone, MessageSquare, Clock, Zap, X,
    Activity, BrainCircuit, ShieldAlert, ChevronRight,
    Calendar, FileText, Mic, BarChart3, Volume2,
    Send, Check, TrendingUp, Target, Award, Bell
} from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend
} from 'recharts';

/* ─── Palette ────────────────────────────────────────────────── */
const SOURCE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#0088FE'];

/* ─── Relative time helper ───────────────────────────────────── */
const relTime = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    const diff = (Date.now() - d) / 60000;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} days ago`;
};

/* ─── Sub‑components ─────────────────────────────────────────── */

/* KPI card */
const KPICard = ({ title, value, icon: Icon, color, bg, trend, onClick }) => (
    <motion.div whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col cursor-pointer transition-all hover:border-blue-100`}>
        <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
            </div>
            {trend !== undefined && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div>
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">{value}</h3>
            <p className="text-[13px] text-gray-500 mt-1">{title}</p>
        </div>
    </motion.div>
);

/* Score tier card */
const ScoreCard = ({ emoji, label, count, colorMap, onClick }) => (
    <motion.div whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
        onClick={onClick}
        className={`p-5 rounded-xl border ${colorMap} cursor-pointer transition-all flex flex-col gap-3`}>
        <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">{emoji} {label}</span>
            <ChevronRight size={16} className="opacity-50" />
        </div>
        <div className="flex items-baseline justify-between border-t border-black/5 pt-3">
            <span className="text-xs font-semibold opacity-70 uppercase tracking-wide">Current</span>
            <span className="text-3xl font-bold">{count}</span>
        </div>
    </motion.div>
);

/* Activity feed item */
const FeedItem = ({ icon: Icon, iconColor, text, time, idx }) => (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.07 }}
        className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 group hover:bg-gray-50/70 -mx-5 px-5 transition-colors rounded-lg">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
            <Icon size={13} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 font-medium leading-snug">{text}</p>
            <p className="text-xs text-gray-400 mt-0.5">{time}</p>
        </div>
    </motion.div>
);

/* ─── Main Dashboard ─────────────────────────────────────────── */
const SalesDashboard = () => {
    const { leads, addActionToLead } = useSales();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [actionModal, setActionModal] = useState(null);
    const [ownerSummary, setOwnerSummary] = useState({ summary: { totalCalls: 0, connected: 0, scheduledMeetings: 0 }, hotAlerts: [] });
    const [ownerSummaryState, setOwnerSummaryState] = useState({ loading: true, error: '' });

    const openModal = (type, lead) => setActionModal({ type, lead });

    useEffect(() => {
        let mounted = true;
        api.get('/ai/voice/owner-summary')
            .then((data) => {
                if (!mounted) return;
                setOwnerSummary({
                    summary: data?.summary || { totalCalls: 0, connected: 0, scheduledMeetings: 0 },
                    hotAlerts: Array.isArray(data?.hotAlerts) ? data.hotAlerts : [],
                });
                setOwnerSummaryState({ loading: false, error: '' });
            })
            .catch(() => {
                if (!mounted) return;
                setOwnerSummary({ summary: { totalCalls: 0, connected: 0, scheduledMeetings: 0 }, hotAlerts: [] });
                setOwnerSummaryState({ loading: false, error: 'Unable to load owner voice summary right now.' });
                showToast({
                    title: 'Owner summary unavailable',
                    description: 'Could not load voice owner summary. Showing default values.',
                    variant: 'warning',
                });
            });
        return () => {
            mounted = false;
        };
    }, [showToast]);

    /* ── Metrics ── */
    const metrics = useMemo(() => {
        const hotLeads = leads.filter(l => l.scoreLabel === 'Hot');
        const warmLeads = leads.filter(l => l.scoreLabel === 'Warm');
        const coldLeads = leads.filter(l => l.scoreLabel === 'Cold');

        const totalCalls = leads.reduce((a, l) =>
            a + (l.communications || []).filter(c => c.type === 'call').length, 0);

        const followupsDue = leads.filter(l =>
            (l.followups || []).some(fu => fu.status === 'Pending')).length;

        const dealsClosed = leads.filter(l =>
            l.status === 'Won' || l.status === 'Converted').length;

        const sourceMap = {};
        leads.forEach(l => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
        const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

        /* AI Activity: flatten timeline events from all leads, sort newest first */
        const allEvents = [];
        leads.forEach(lead => {
            (lead.timeline || []).forEach(ev => {
                allEvents.push({ ...ev, leadName: lead.name, leadId: lead.id });
            });
        });
        allEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

        /* High priority: sort by AI score descending, top 10 */
        const priorityLeads = [...leads].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)).slice(0, 10);

        return {
            totalLeads: leads.length,
            hotLeads, warmLeads, coldLeads,
            aiCallsToday: totalCalls,
            waChats: leads.reduce((a, l) => a + (l.communications || []).filter(c => c.type === 'whatsapp').length, 0),
            followupsDue,
            dealsClosed,
            sourceData,
            aiActivity: allEvents.slice(0, 12),
            priorityLeads,
        };
    }, [leads]);

    /* Hot leads to show in alert bar (up to 3) */
    const hotAlertLeads = metrics.hotLeads.slice(0, 3);

    /* AI activity icon map */
    const ACTIVITY_ICON = {
        call: { icon: Phone, color: 'bg-indigo-100 text-indigo-600' },
        whatsapp: { icon: MessageSquare, color: 'bg-green-100  text-green-600' },
        meeting: { icon: Calendar, color: 'bg-orange-100 text-orange-600' },
        note: { icon: FileText, color: 'bg-gray-100   text-gray-500' },
        ai_action: { icon: BrainCircuit, color: 'bg-purple-100 text-purple-600' },
        capture: { icon: Zap, color: 'bg-blue-100   text-blue-600' },
        converted: { icon: Award, color: 'bg-emerald-100 text-emerald-600' },
        default: { icon: Activity, color: 'bg-gray-100   text-gray-400' },
    };

    /* Score colour map */
    const SCORE_COLOR = (s) =>
        s >= 80 ? 'text-red-600' : s >= 50 ? 'text-orange-500' : 'text-sky-500';

    const STATUS_BADGE = {
        Hot: 'bg-red-100 text-red-700',
        Warm: 'bg-orange-100 text-orange-700',
        Cold: 'bg-sky-100 text-sky-700',
        New: 'bg-gray-100 text-gray-700',
        Contacted: 'bg-blue-100 text-blue-700',
        'Follow-up Scheduled': 'bg-purple-100 text-purple-700',
        Converted: 'bg-emerald-100 text-emerald-700',
        Won: 'bg-emerald-100 text-emerald-700',
    };

    /* ─── Action Modal ─── */
    const renderModal = () => {
        if (!actionModal) return null;
        const { type, lead } = actionModal;
        return (
            <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => setActionModal(null)}>
                    <motion.div
                        initial={{ scale: 0.95, y: 16, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 16, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${type === 'whatsapp' ? 'max-w-md' : 'max-w-sm'}`}>

                        {/* CALL */}
                        {type === 'call' && (
                            <div className="bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col">
                                <button onClick={() => setActionModal(null)} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 p-2 rounded-full"><X size={15} /></button>
                                <div className="p-8 flex flex-col items-center text-center mt-2">
                                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-5 relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" />
                                        <Phone size={36} className="text-white relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{lead?.name}</h3>
                                    <p className="text-blue-200 text-sm mt-1 tracking-widest">{lead?.phone}</p>
                                    <div className="flex items-center gap-2 mt-6 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-emerald-300 text-sm font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connecting AI Agent...
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 pb-10">
                                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 transition-colors"><Mic size={22} /></button>
                                    <button onClick={() => { if (lead?.id) addActionToLead(lead.id, 'call', 'Outbound Call', 'Called via Dashboard.'); setActionModal(null); }}
                                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform hover:scale-105">
                                        <Phone size={26} className="rotate-[135deg]" />
                                    </button>
                                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 transition-colors"><Volume2 size={22} /></button>
                                </div>
                            </div>
                        )}

                        {/* WHATSAPP */}
                        {type === 'whatsapp' && (
                            <div className="flex flex-col" style={{ minHeight: 400 }}>
                                <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
                                    <button onClick={() => setActionModal(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg shrink-0">{lead?.name?.[0]}</div>
                                    <div>
                                        <p className="font-bold text-sm">{lead?.name}</p>
                                        <p className="text-xs text-white/60">{lead?.phone} · Online</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-[#ECE5DD] p-4 flex flex-col gap-2 min-h-[180px]">
                                    <div className="bg-white self-start max-w-[80%] p-2.5 rounded-xl rounded-tl-none shadow-sm text-sm text-gray-800">
                                        Hi, I was asking about the project. <div className="text-[10px] text-gray-400 text-right mt-0.5">10:45 AM</div>
                                    </div>
                                    <div className="bg-[#DCF8C6] self-end max-w-[80%] p-2.5 rounded-xl rounded-tr-none shadow-sm text-sm text-gray-800">
                                        Hello {lead?.name?.split(' ')[0]}, thanks for reaching out! <div className="text-[10px] text-gray-500 text-right mt-0.5 flex items-center justify-end gap-1">10:46 AM <Check size={11} className="text-blue-500" /></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
                                    <div className="flex-1 bg-white flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-200">
                                        <input id="dashWAInput" type="text" placeholder="Type a message..." className="flex-1 text-sm bg-transparent outline-none" />
                                    </div>
                                    <button onClick={() => { const v = document.getElementById('dashWAInput')?.value; if (v && lead?.id) addActionToLead(lead.id, 'whatsapp', 'WhatsApp sent', v); setActionModal(null); }}
                                        className="w-10 h-10 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full flex items-center justify-center shadow-sm transition-colors">
                                        <Send size={15} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SCHEDULE */}
                        {type === 'schedule' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-indigo-500" /> Schedule Follow-up</h3>
                                    <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={15} /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">For <span className="font-semibold text-gray-800">{lead?.name}</span></p>
                                <input id="dashDateInput" type="date" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 mb-3 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100" />
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map(t => (
                                        <button key={t} className="py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all">{t}</button>
                                    ))}
                                </div>
                                <button onClick={() => { const d = document.getElementById('dashDateInput')?.value; if (d && lead?.id) addActionToLead(lead.id, 'meeting', 'Follow-up Scheduled', `Meeting on ${d}`, { date: d }); setActionModal(null); }}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                    <Check size={15} /> Confirm Follow-up
                                </button>
                            </div>
                        )}

                        {/* NOTE */}
                        {type === 'note' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-gray-500" /> Add Note</h3>
                                    <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={15} /></button>
                                </div>
                                <textarea id="dashNoteInput" rows="4" placeholder={`Notes for ${lead?.name}...`}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-200 resize-none mb-3" />
                                <button onClick={() => { const v = document.getElementById('dashNoteInput')?.value; if (v && lead?.id) addActionToLead(lead.id, 'note', 'Note Added', v); setActionModal(null); }}
                                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg text-sm transition-colors">
                                    Save Note
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    /* ─────────────────────── RENDER ─────────────────────────── */
    return (
        <div className="font-sans text-gray-900 pb-16">
            {renderModal()}

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Sales Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">AI‑powered unified sales operations</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> AI Agents Active
                    </span>
                    <button onClick={() => navigate('/sales/interactions')}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                        <Bell size={12} /> Interactions
                    </button>
                </div>
            </div>

            {/* ── SECTION 1: KPI CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <KPICard title="Total Leads" value={metrics.totalLeads} icon={Users} color="text-blue-600" bg="bg-blue-50" trend={12} onClick={() => navigate('/sales/leads')} />
                <KPICard title="Hot Leads" value={metrics.hotLeads.length} icon={Zap} color="text-red-600" bg="bg-red-50" trend={8} onClick={() => navigate('/sales/leads', { state: { filter: 'Hot' } })} />
                <KPICard title="AI Calls Today" value={metrics.aiCallsToday} icon={Phone} color="text-indigo-600" bg="bg-indigo-50" trend={5} onClick={() => navigate('/sales/interactions')} />
                <KPICard title="WhatsApp Chats" value={metrics.waChats} icon={MessageSquare} color="text-green-600" bg="bg-green-50" trend={18} onClick={() => navigate('/sales/whatsapp')} />
                <KPICard title="Follow-ups Due" value={metrics.followupsDue} icon={Clock} color="text-orange-600" bg="bg-orange-50" trend={-3} onClick={() => navigate('/sales/leads', { state: { filter: 'Follow-up Scheduled' } })} />
                <KPICard title="Deals Closed" value={metrics.dealsClosed} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" trend={22} onClick={() => navigate('/sales/leads', { state: { filter: 'Converted' } })} />
            </div>

            {/* ── SECTION 2: HOT LEAD ALERT BAR ── */}
            {ownerSummary.hotAlerts.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-purple-800 uppercase tracking-wide">Voice Escalation Alerts</h2>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {ownerSummary.hotAlerts.length} hot
                        </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {ownerSummary.hotAlerts.slice(0, 3).map((alert, idx) => (
                            <div key={alert.conversationId || idx} className="bg-white border border-purple-100 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-900 truncate">{alert.payload?.contactName || 'Escalated voice lead'}</p>
                                <p className="text-[11px] text-gray-500 mt-1">{relTime(alert.createdAt)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {hotAlertLeads.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🔥</span>
                        <h2 className="text-sm font-bold text-red-800 uppercase tracking-widest">Hot Lead Alert</h2>
                        <span className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{hotAlertLeads.length} alerts</span>
                    </div>
                    <div className="space-y-2">
                        {hotAlertLeads.map((lead, i) => (
                            <motion.div key={lead.id}
                                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-lg border border-red-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-red-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center shrink-0">{lead.name[0]}</div>
                                    <div>
                                        <span className="font-bold text-gray-900 text-sm">{lead.name}</span>
                                        <span className="text-gray-500 text-sm"> · </span>
                                        <span className="text-gray-600 text-sm">{lead.lastInteraction || lead.insight || 'High intent detected'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => openModal('call', lead)}
                                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1">
                                        <Phone size={11} /> Call
                                    </button>
                                    <button onClick={() => openModal('whatsapp', lead)}
                                        className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors flex items-center gap-1">
                                        <MessageSquare size={11} /> WhatsApp
                                    </button>
                                    <button onClick={() => navigate(`/sales/leads/${lead.id}`)}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors flex items-center gap-1">
                                        Open Lead <ChevronRight size={11} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECTION 3: LEFT / RIGHT SPLIT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

                {/* LEFT: Lead Sources Chart */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col min-h-[360px]">
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={16} className="text-blue-600" />
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Lead Sources</h2>
                    </div>
                    {metrics.sourceData.length > 0 ? (
                        <>
                            <div className="flex-1" style={{ minHeight: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={metrics.sourceData} cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                            {metrics.sourceData.map((_, idx) => (
                                                <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }} />
                                        <Legend iconSize={10} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Source list */}
                            <div className="space-y-2 mt-3">
                                {metrics.sourceData.map((s, i) => (
                                    <div key={s.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                                        <span className="text-xs text-gray-600 flex-1">{s.name}</span>
                                        <span className="text-xs font-bold text-gray-800">{s.value}</span>
                                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(s.value / metrics.totalLeads) * 100}%`, background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No lead source data yet</div>
                    )}
                </div>

                {/* RIGHT: AI Activity Feed */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col min-h-[360px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BrainCircuit size={16} className="text-purple-600" />
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Activity Feed</h2>
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" /> Live
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-0">
                        {metrics.aiActivity.length > 0 ? metrics.aiActivity.map((ev, i) => {
                            const cfg = ACTIVITY_ICON[ev.type] || ACTIVITY_ICON.default;
                            return (
                                <FeedItem key={ev.id || i} idx={i}
                                    icon={cfg.icon} iconColor={cfg.color}
                                    text={`${ev.action}${ev.leadName ? ` — ${ev.leadName}` : ''}`}
                                    time={relTime(ev.time) || ev.time} />
                            );
                        }) : (
                            /* Fallback mock feed */
                            [
                                { icon: Phone, color: 'bg-indigo-100 text-indigo-600', text: 'AI called Rahul Kumar — Qualified', time: '2 min ago' },
                                { icon: MessageSquare, color: 'bg-green-100 text-green-600', text: 'Brochure sent to Sneha Gupta via WhatsApp', time: '8 min ago' },
                                { icon: Calendar, color: 'bg-orange-100 text-orange-600', text: 'Follow-up scheduled for Priya Sharma', time: '15 min ago' },
                                { icon: MessageSquare, color: 'bg-green-100 text-green-600', text: 'Customer replied — Arjun Mehta', time: '22 min ago' },
                                { icon: BrainCircuit, color: 'bg-purple-100 text-purple-600', text: 'AI scored lead: Hot — Pooja Nair (94)', time: '35 min ago' },
                                { icon: Zap, color: 'bg-blue-100 text-blue-600', text: 'New lead captured from Meta Ads', time: '50 min ago' },
                            ].map((item, i) => <FeedItem key={i} idx={i} {...item} />)
                        )}
                    </div>
                    <button onClick={() => navigate('/sales/interactions')}
                        className="mt-4 w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        View All Interactions <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Voice Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{ownerSummaryState.loading ? '—' : (ownerSummary.summary.totalCalls || 0)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Connected Calls</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-2">{ownerSummaryState.loading ? '—' : (ownerSummary.summary.connected || 0)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Meetings Scheduled</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-2">{ownerSummaryState.loading ? '—' : (ownerSummary.summary.scheduledMeetings || 0)}</p>
                </div>
            </div>
            {ownerSummaryState.error && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
                    {ownerSummaryState.error}
                </p>
            )}

            {/* ── SECTION 4: AI LEAD SCORING ── */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit size={16} className="text-purple-600" />
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Lead Scoring</h2>
                    <span className="text-xs text-gray-400 ml-1">Click to filter leads</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreCard emoji="🔥" label="Hot Leads" count={metrics.hotLeads.length} colorMap="bg-red-50 border-red-200 text-red-700" onClick={() => navigate('/sales/leads', { state: { filter: 'Hot' } })} />
                    <ScoreCard emoji="🌡" label="Warm Leads" count={metrics.warmLeads.length} colorMap="bg-orange-50 border-orange-200 text-orange-700" onClick={() => navigate('/sales/leads', { state: { filter: 'Warm' } })} />
                    <ScoreCard emoji="❄" label="Cold Leads" count={metrics.coldLeads.length} colorMap="bg-sky-50 border-sky-200 text-sky-700" onClick={() => navigate('/sales/leads', { state: { filter: 'Cold' } })} />
                </div>
            </div>

            {/* ── SECTION 5: HIGH PRIORITY LEADS TABLE ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-red-500" />
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">High Priority Leads</h2>
                    </div>
                    <button onClick={() => navigate('/sales/leads')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline">
                        View All <ChevronRight size={12} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="py-3 px-5 font-semibold min-w-[180px]">Name</th>
                                <th className="py-3 px-5 font-semibold min-w-[120px]">Source</th>
                                <th className="py-3 px-5 font-semibold min-w-[100px]">AI Score</th>
                                <th className="py-3 px-5 font-semibold min-w-[110px]">Status</th>
                                <th className="py-3 px-5 font-semibold min-w-[120px]">Last Activity</th>
                                <th className="py-3 px-5 font-semibold text-right min-w-[160px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {metrics.priorityLeads.map((lead, idx) => (
                                <tr key={lead.id}
                                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/sales/leads/${lead.id}`)}>
                                    {/* Name */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {lead.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{lead.name}</p>
                                                <p className="text-xs text-gray-400">{lead.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Source */}
                                    <td className="py-3.5 px-5 text-sm font-medium text-gray-600">{lead.source}</td>
                                    {/* AI Score */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${SCORE_COLOR(lead.aiScore || 0)}`}>{lead.aiScore ?? '—'}</span>
                                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${lead.aiScore >= 80 ? 'bg-red-500' : lead.aiScore >= 50 ? 'bg-orange-400' : 'bg-sky-400'}`}
                                                    style={{ width: `${lead.aiScore || 0}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td className="py-3.5 px-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {lead.status === 'Won' ? 'Converted' : lead.status}
                                        </span>
                                    </td>
                                    {/* Last Activity */}
                                    <td className="py-3.5 px-5 text-xs text-gray-500">{lead.lastInteraction || '—'}</td>
                                    {/* Actions */}
                                    <td className="py-3.5 px-5 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => openModal('call', lead)}
                                                className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1">
                                                <Phone size={11} /> Call
                                            </button>
                                            <button onClick={() => openModal('whatsapp', lead)}
                                                className="px-2.5 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors flex items-center gap-1">
                                                <MessageSquare size={11} /> WA
                                            </button>
                                            <button onClick={() => navigate(`/sales/leads/${lead.id}`)}
                                                className="px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1">
                                                View <ChevronRight size={11} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {metrics.priorityLeads.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-400">
                                        <Activity size={32} className="text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm">No leads yet</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;

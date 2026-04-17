import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useToast } from '../../components/ui/Toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ChevronRight, Phone, MessageSquare, Calendar,
    X, Check, Mic, Volume2, Send, FileText, Edit3, ArrowUpDown,
    SortAsc, Users, Plus
} from 'lucide-react';

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
    New: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    Contacted: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
    Hot: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    Warm: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    Cold: { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-400' },
    'Follow-up Scheduled': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    Converted: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    Won: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    Closed: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    Lost: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
};

const SCORE_COLOR = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-sky-500';
};

const STATUSES = ['New', 'Contacted', 'Hot', 'Warm', 'Cold', 'Follow-up Scheduled', 'Converted', 'Closed', 'Lost'];

const FILTERS = [
    { label: 'All Leads', key: 'all' },
    { label: 'New', key: 'New' },
    { label: 'Hot', key: 'Hot' },
    { label: 'Warm', key: 'Warm' },
    { label: 'Cold', key: 'Cold' },
    { label: 'Follow-ups', key: 'Follow-up Scheduled' },
    { label: 'Converted', key: 'Converted' },
];

const SORT_OPTIONS = [
    { label: 'Newest First', key: 'newest' },
    { label: 'Highest AI Score', key: 'score' },
    { label: 'Recent Interaction', key: 'interaction' },
    { label: 'Lead Source', key: 'source' },
];

/* ─── StatusBadge ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status === 'Won' ? 'Converted' : status}
        </span>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const SalesLeads = () => {
const { leads, updateLeadStatus, addActionToLead, addLead } = useSales();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [filter, setFilter] = useState(location.state?.filter || 'all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [showSort, setShowSort] = useState(false);
    const [actionModal, setActionModal] = useState(null);

    // Modal form states
    const [waText, setWaText] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [noteText, setNoteText] = useState('');
const [showAddLead, setShowAddLead] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState({ name: '', phone: '', email: '', campaign: '' });
    const [addingLead, setAddingLead] = useState(false);
    const [addError, setAddError] = useState('');

    const handleSubmitNewLead = async (e) => {
        e.preventDefault();
        if (addingLead) return;

        const payload = {
            name: newLeadForm.name.trim(),
            phone: newLeadForm.phone.trim(),
            email: newLeadForm.email.trim(),
            campaign: newLeadForm.campaign.trim(),
            source: 'Manual',
            status: 'New',
        };

        if (!payload.name || !payload.phone) {
            setAddError('Name and phone are required.');
            return;
        }
        const cleanedPhone = payload.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
        if (!/^\d{7,15}$/.test(cleanedPhone)) {
            setAddError('Phone number must be 7 to 15 digits.');
            return;
        }
        if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
            setAddError('Please enter a valid email address.');
            return;
        }

        setAddingLead(true);
        setAddError('');
        try {
            await addLead(payload);
            setNewLeadForm({ name: '', phone: '', email: '', campaign: '' });
            setShowAddLead(false);
            showToast({
                title: 'Lead added',
                description: `${payload.name} was added successfully.`,
                variant: 'success',
            });
        } catch (err) {
            setAddError(err?.message || 'Failed to add lead. Please try again.');
            showToast({
                title: 'Failed to add lead',
                description: err?.message || 'Please check the form and try again.',
                variant: 'error',
            });
        } finally {
            setAddingLead(false);
        }
    };

    const handleStatusChange = async (leadId, nextStatus) => {
        const ok = await updateLeadStatus(leadId, nextStatus);
        if (ok) {
            showToast({
                title: 'Status updated',
                description: `Lead status changed to ${nextStatus}.`,
                variant: 'success',
            });
        } else {
            showToast({
                title: 'Status update failed',
                description: 'Could not save status change. Please retry.',
                variant: 'error',
            });
        }
    };

    /* ─── Filter + Search + Sort ─── */
    const displayedLeads = useMemo(() => {
        let list = [...leads];

        // Filter
        if (filter !== 'all') {
            if (filter === 'Converted') {
                list = list.filter(l => l.status === 'Won' || l.status === 'Converted');
            } else if (['Hot', 'Warm', 'Cold'].includes(filter)) {
                list = list.filter(l => l.scoreLabel === filter || l.status === filter);
            } else if (filter === 'Follow-up Scheduled') {
                list = list.filter(l => l.status === 'Follow-up Scheduled' || (l.followups && l.followups.length > 0));
            } else {
                list = list.filter(l => l.status === filter);
            }
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(l =>
                l.name?.toLowerCase().includes(q) ||
                l.phone?.toLowerCase().includes(q) ||
                l.campaign?.toLowerCase().includes(q) ||
                l.project?.toLowerCase().includes(q) ||
                l.source?.toLowerCase().includes(q)
            );
        }

        // Sort
        if (sort === 'newest') {
            list.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        } else if (sort === 'score') {
            list.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
        } else if (sort === 'source') {
            list.sort((a, b) => (a.source || '').localeCompare(b.source || ''));
        }

        return list;
    }, [leads, filter, search, sort]);

    /* ─── Action modal helpers ─── */
    const openModal = (type, lead, e) => {
        e?.stopPropagation();
        setWaText(''); setScheduleDate(''); setNoteText('');
        setActionModal({ type, lead });
    };

    /* ─── Modal Renderer ─── */
    const renderModal = () => {
        if (!actionModal) return null;
        const { type, lead } = actionModal;

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => setActionModal(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 16, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 16, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${type === 'whatsapp' ? 'max-w-md' : 'max-w-sm'}`}
                    >
                        {/* CALL */}
                        {type === 'call' && (
                            <div className="bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col">
                                <button onClick={() => setActionModal(null)} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 p-2 rounded-full transition-colors"><X size={16} /></button>
                                <div className="p-8 flex flex-col items-center text-center mt-2">
                                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-5 relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" />
                                        <Phone size={36} className="text-white relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{lead?.name}</h3>
                                    <p className="text-blue-200 text-sm mt-1 font-medium tracking-widest">{lead?.phone}</p>
                                    <div className="flex items-center gap-2 mt-6 bg-white/10 border border-white/10 px-4 py-2 rounded-full text-emerald-300 text-sm font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Connecting AI Agent...
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 pb-10">
                                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"><Mic size={22} /></button>
                                    <button
                                        onClick={() => { addActionToLead(lead.id, 'call', 'Outbound Call', 'Manual call placed.'); setActionModal(null); }}
                                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform hover:scale-105">
                                        <Phone size={26} className="rotate-[135deg]" />
                                    </button>
                                    <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"><Volume2 size={22} /></button>
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
                                    <div className="self-center">
                                        <span className="bg-white/70 text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">Today</span>
                                    </div>
                                    <div className="bg-[#DCF8C6] self-end max-w-[80%] p-2.5 rounded-xl rounded-tr-none shadow-sm text-sm text-gray-800">
                                        Hello {lead?.name?.split(' ')[0]}, thanks for your interest! How can I help you? 👋
                                        <p className="text-[10px] text-gray-400 text-right mt-0.5">Now · <Check size={10} className="inline text-blue-500" /></p>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
                                    <div className="flex-1 bg-white flex items-center rounded-full px-3 py-2 shadow-sm border border-gray-200">
                                        <input
                                            type="text"
                                            value={waText}
                                            onChange={e => setWaText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && waText.trim()) { addActionToLead(lead.id, 'whatsapp', 'WhatsApp sent', waText.trim()); setActionModal(null); } }}
                                            placeholder="Type a message..."
                                            className="flex-1 text-sm bg-transparent outline-none"
                                        />
                                        <FileText size={15} className="text-gray-400 ml-2 shrink-0" />
                                    </div>
                                    <button
                                        onClick={() => { if (waText.trim()) addActionToLead(lead.id, 'whatsapp', 'WhatsApp sent', waText.trim()); setActionModal(null); }}
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
                                    <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">For <span className="font-semibold text-gray-800">{lead?.name}</span></p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Date</label>
                                        <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100" />
                                    </div>
                                    <button
                                        onClick={() => { if (scheduleDate) addActionToLead(lead.id, 'meeting', 'Follow-up Scheduled', 'Meeting booked.', { date: scheduleDate }); setActionModal(null); }}
                                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                        <Check size={15} /> Confirm Follow-up
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NOTE */}
                        {type === 'note' && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Edit3 size={16} className="text-gray-500" /> Add Note</h3>
                                    <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} /></button>
                                </div>
                                <div className="space-y-3">
                                    <textarea rows="4" value={noteText} onChange={e => setNoteText(e.target.value)}
                                        placeholder={`Notes for ${lead?.name}...`}
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
                                    <button
                                        onClick={() => { if (noteText.trim()) addActionToLead(lead.id, 'note', 'Note Added', noteText.trim()); setActionModal(null); }}
                                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm transition-colors">
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="font-sans text-gray-900 pb-12">
            {renderModal()}

            {/* Add Lead Modal */}
            <AnimatePresence>
                {showAddLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setShowAddLead(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.96, y: 16, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.96, y: 16, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden"
                        >
                            <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">Add New Lead</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Create a new lead manually</p>
                                </div>
                                <button
                                    onClick={() => setShowAddLead(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmitNewLead}
                                className="p-6 space-y-4"
                            >
                                {addError && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        {addError}
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={newLeadForm.name}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Lead name"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Phone</label>
                                    <input
                                        type="tel"
                                        value={newLeadForm.phone}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+91 98xxxxx"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email (optional)</label>
                                    <input
                                        type="email"
                                        value={newLeadForm.email}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, email: e.target.value }))}
                                        placeholder="email@example.com"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Campaign (optional)</label>
                                    <input
                                        type="text"
                                        value={newLeadForm.campaign}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, campaign: e.target.value }))}
                                        placeholder="Campaign name"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddLead(false);
                                            setAddError('');
                                        }}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newLeadForm.name.trim() || !newLeadForm.phone.trim() || addingLead}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> {addingLead ? 'Adding...' : 'Add Lead'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Header ─── */}
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Leads Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Hover any row for quick actions · Click a row to open the full lead workspace</p>
                </div>
                <button
                    onClick={() => {
                        setAddError('');
                        setShowAddLead(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
                >
                    <Plus size={16} /> Add Lead
                </button>
            </div>

            {/* ─── Search + Sort ─── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, project or campaign..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="relative shrink-0">
                    <button
                        onClick={() => setShowSort(v => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 transition-colors"
                    >
                        <ArrowUpDown size={15} className="text-gray-500" />
                        Sort: {SORT_OPTIONS.find(s => s.key === sort)?.label}
                    </button>
                    <AnimatePresence>
                        {showSort && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px] py-1"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <button key={opt.key} onClick={() => { setSort(opt.key); setShowSort(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${sort === opt.key ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <SortAsc size={14} className={sort === opt.key ? 'text-blue-500' : 'text-gray-400'} />
                                        {opt.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── Filter Tabs ─── */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                <Filter size={15} className="text-gray-400 shrink-0 mr-1" />
                {FILTERS.map(f => (
                    <button key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3.5 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors shrink-0 ${filter === f.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >{f.label}</button>
                ))}
                <span className="ml-auto text-xs text-gray-400 font-medium shrink-0">{displayedLeads.length} leads</span>
            </div>

            {/* ─── Table ─── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="py-3 px-4 font-semibold min-w-[160px]">Lead Name</th>
                                <th className="py-3 px-4 font-semibold min-w-[120px]">Phone</th>
                                <th className="py-3 px-4 font-semibold min-w-[110px]">Source</th>
                                <th className="py-3 px-4 font-semibold min-w-[160px]">Project / Campaign</th>
                                <th className="py-3 px-4 font-semibold min-w-[90px] text-center">AI Score</th>
                                <th className="py-3 px-4 font-semibold min-w-[130px]">Status</th>
                                <th className="py-3 px-4 font-semibold min-w-[160px]">Last Interaction</th>
                                <th className="py-3 px-4 font-semibold min-w-[120px]">Assigned Owner</th>
                                <th className="py-3 px-4 font-semibold text-right min-w-[160px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {displayedLeads.map(lead => (
                                <tr
                                    key={lead.id}
                                    onClick={() => navigate(`/sales/leads/${lead.id}`)}
                                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                                >
                                    {/* Name */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {lead.name?.[0]}
                                            </div>
                                            <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{lead.name}</span>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{lead.phone}</td>

                                    {/* Source */}
                                    <td className="py-3.5 px-4">
                                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{lead.source}</span>
                                    </td>

                                    {/* Project / Campaign */}
                                    <td className="py-3.5 px-4">
                                        <p className="text-gray-800 font-medium text-xs">{lead.project}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{lead.campaign}</p>
                                    </td>

                                    {/* AI Score */}
                                    <td className="py-3.5 px-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-sm font-bold ${SCORE_COLOR(lead.aiScore || 0)}`}>{lead.aiScore ?? '—'}</span>
                                            <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${(lead.aiScore || 0) >= 80 ? 'bg-red-500' : (lead.aiScore || 0) >= 50 ? 'bg-orange-400' : 'bg-sky-400'}`}
                                                    style={{ width: `${lead.aiScore || 0}%` }} />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                        <select
                                            value={lead.status}
                                            onChange={e => handleStatusChange(lead.id, e.target.value)}
                                            className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${(STATUS_CONFIG[lead.status] || STATUS_CONFIG.New).bg} ${(STATUS_CONFIG[lead.status] || STATUS_CONFIG.New).text}`}
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s === 'Won' ? 'Converted' : s}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* Last Interaction */}
                                    <td className="py-3.5 px-4">
                                        <span className="text-gray-600 text-xs">{lead.lastInteraction || '—'}</span>
                                    </td>

                                    {/* Assigned Owner */}
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0">
                                                {lead.assignedTo?.[0] || '?'}
                                            </div>
                                            <span className="text-xs text-gray-600">{lead.assignedTo || 'Unassigned'}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={e => openModal('call', lead, e)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Call">
                                                <Phone size={14} />
                                            </button>
                                            <button onClick={e => openModal('whatsapp', lead, e)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                                                <MessageSquare size={14} />
                                            </button>
                                            <button onClick={e => openModal('schedule', lead, e)}
                                                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Schedule">
                                                <Calendar size={14} />
                                            </button>
                                            <button onClick={e => openModal('note', lead, e)}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Note">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => navigate(`/sales/leads/${lead.id}`)}
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 ml-1" title="View Workspace">
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {displayedLeads.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Search size={36} className="text-gray-200" />
                                            <p className="font-medium">No leads found</p>
                                            <p className="text-xs">Try adjusting your search or filter</p>
                                        </div>
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

export default SalesLeads;

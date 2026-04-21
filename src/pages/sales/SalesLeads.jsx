import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import {
    getAllTimeZones,
    getDefaultTimeZone,
    getLanguageSelectOptions,
    DEFAULT_PREFERRED_LOCALE,
    resolveTimeZoneOption,
} from '../../utils/localeOptions';
import { useToast } from '../../components/ui/Toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ChevronRight, Phone, MessageSquare, Calendar,
    X, Edit3, ArrowUpDown,
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
const { leads, updateLeadStatus, addLead } = useSales();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [filter, setFilter] = useState(location.state?.filter || 'all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [showSort, setShowSort] = useState(false);
const [showAddLead, setShowAddLead] = useState(false);
    const timeZoneList = useMemo(() => getAllTimeZones(), []);
    const languageOptions = useMemo(() => getLanguageSelectOptions(), []);
    const [newLeadForm, setNewLeadForm] = useState(() => ({
        name: '',
        phone: '',
        email: '',
        campaign: '',
        timezone: resolveTimeZoneOption(getDefaultTimeZone(), getAllTimeZones()),
        preferredLocale: DEFAULT_PREFERRED_LOCALE,
    }));
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
            timezone: newLeadForm.timezone?.trim() || null,
            preferredLocale: newLeadForm.preferredLocale || DEFAULT_PREFERRED_LOCALE,
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
            setNewLeadForm({
                name: '',
                phone: '',
                email: '',
                campaign: '',
                timezone: resolveTimeZoneOption(getDefaultTimeZone(), timeZoneList),
                preferredLocale: DEFAULT_PREFERRED_LOCALE,
            });
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

    const goToLeadWorkspaceModal = (lead, openModal, e) => {
        e?.stopPropagation();
        navigate(`/sales/leads/${lead.id}`, { state: { openModal } });
    };

    return (
        <div className="font-sans text-gray-900 pb-12">
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
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Timezone</label>
                                    <select
                                        value={resolveTimeZoneOption(newLeadForm.timezone, timeZoneList)}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, timezone: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 max-h-40"
                                        size={1}
                                    >
                                        {timeZoneList.map((tz) => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Language</label>
                                    <select
                                        value={newLeadForm.preferredLocale}
                                        onChange={(e) => setNewLeadForm(p => ({ ...p, preferredLocale: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 max-h-40"
                                    >
                                        {languageOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-gray-400 mt-1">Default: Hinglish. AI call and WhatsApp match the lead&apos;s language when possible.</p>
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
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={(e) => goToLeadWorkspaceModal(lead, 'call', e)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                                                title="AI Call — same as workspace"
                                            >
                                                <Phone size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => goToLeadWorkspaceModal(lead, 'whatsapp', e)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm transition-colors"
                                                title="WhatsApp — same as workspace"
                                            >
                                                <MessageSquare size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => goToLeadWorkspaceModal(lead, 'schedule', e)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
                                                title="Schedule — same as workspace"
                                            >
                                                <Calendar size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => goToLeadWorkspaceModal(lead, 'note', e)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
                                                title="Note — same as workspace"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/sales/leads/${lead.id}`)}
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 ml-0.5"
                                                title="Open workspace"
                                            >
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

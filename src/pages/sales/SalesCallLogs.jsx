import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Phone, Play, Pause, FileText, Download,
    X, Search, ExternalLink, BrainCircuit, User, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Outcome badge config ───────────────────────────────────── */
const OUTCOME_CFG = {
    Qualified: 'bg-emerald-100 text-emerald-700',
    'No Answer': 'bg-orange-100  text-orange-700',
    Voicemail: 'bg-yellow-100  text-yellow-700',
    Callback: 'bg-blue-100    text-blue-700',
    Interested: 'bg-indigo-100  text-indigo-700',
    Rejected: 'bg-red-100     text-red-700',
};
const outcomeCls = (o) => OUTCOME_CFG[o] || 'bg-gray-100 text-gray-600';

/* ─── Helper: type badge ─────────────────────────────────────── */
const TypeBadge = ({ caller }) =>
    caller === 'AI'
        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700"><BrainCircuit size={9} />AI</span>
        : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700"><User size={9} />Manual</span>;

/* ─── Recording mini-player ──────────────────────────────────── */
const RecordingPlayer = ({ call, playing, onToggle }) => (
    <div className="flex items-center gap-2">
        <button onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-colors shrink-0">
            {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-[64px]">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    animate={{ width: playing ? '45%' : '0%' }}
                    transition={{ duration: playing ? 2 : 0 }}
                    className="h-full bg-indigo-500 rounded-full"
                />
            </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Download">
            <Download size={12} />
        </button>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const SalesCallLogs = () => {
    const { leads } = useSales();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [playingId, setPlayingId] = useState(null);
    const [transcript, setTranscript] = useState(null); // { call, leadName }

    /* Flatten all calls from all leads */
    const allCalls = useMemo(() => {
        const list = [];
        leads.forEach(lead => {
            (lead.communications || [])
                .filter(c => c.type === 'call')
                .forEach(c => list.push({ ...c, leadId: lead.id, leadName: lead.name, phone: lead.phone }));
            /* Also surface timeline call events that have no sibling communication */
            (lead.timeline || [])
                .filter(ev => ev.type === 'call' && !list.some(c => c.leadId === lead.id && c.time === ev.time))
                .forEach(ev => list.push({
                    id: ev.id || `tl-${lead.id}-${ev.time}`,
                    leadId: lead.id,
                    leadName: lead.name,
                    phone: lead.phone,
                    time: ev.time,
                    duration: ev.duration || '—',
                    outcome: ev.detail || 'Completed',
                    caller: 'Manual',
                    recording: null,
                    transcript: null,
                }));
        });
        return list.sort((a, b) => new Date(b.time) - new Date(a.time));
    }, [leads]);

    const filtered = useMemo(() => {
        if (!search.trim()) return allCalls;
        const q = search.toLowerCase();
        return allCalls.filter(c =>
            c.leadName?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.outcome?.toLowerCase().includes(q)
        );
    }, [allCalls, search]);

    /* ─── Transcript Modal ─── */
    const renderTranscriptModal = () => {
        if (!transcript) return null;
        const { call, leadName } = transcript;
        const lines = call.transcript || [];
        return (
            <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
                    onClick={() => setTranscript(null)}>
                    <motion.div
                        initial={{ scale: 0.96, y: 16, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.96, y: 16, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-blue-600" />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Call Transcript</p>
                                    <p className="text-xs text-gray-500">{leadName} · {call.time}</p>
                                </div>
                            </div>
                            <button onClick={() => setTranscript(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={15} /></button>
                        </div>
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                            {lines.length > 0 ? lines.map((line, i) => (
                                <div key={i} className={`flex gap-3 ${line.speaker === 'Lead' ? 'flex-row-reverse' : line.speaker === 'System' ? 'justify-center' : 'flex-row'}`}>
                                    {line.speaker !== 'System' && (
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${line.speaker === 'AI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {line.speaker[0]}
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] ${line.speaker === 'System' ? 'w-full text-center' : ''}`}>
                                        {line.speaker !== 'System' && (
                                            <p className="text-[10px] font-bold text-gray-400 mb-1">{line.speaker}</p>
                                        )}
                                        <div className={`p-2.5 rounded-xl text-sm border ${line.speaker === 'AI' ? 'bg-white border-gray-200 text-gray-800' :
                                                line.speaker === 'System' ? 'bg-yellow-50 border-yellow-100 text-yellow-700 text-xs text-center rounded-lg' :
                                                    'bg-blue-600 text-white border-transparent'}`}>
                                            {line.text}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 italic text-sm py-10">No transcript available for this call.</p>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-right">
                            <button onClick={() => setTranscript(null)}
                                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    /* ─────────────────────── RENDER ─────────────────────────── */
    return (
        <div className="font-sans text-gray-900 pb-12">
            {renderTranscriptModal()}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Interactions
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Every AI and manual call logged — with recordings and transcripts.</p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Total Calls', value: allCalls.length, color: 'text-gray-900' },
                    { label: 'AI Calls', value: allCalls.filter(c => c.caller === 'AI').length, color: 'text-purple-700' },
                    { label: 'Manual Calls', value: allCalls.filter(c => c.caller !== 'AI').length, color: 'text-blue-700' },
                    { label: 'Qualified', value: allCalls.filter(c => c.outcome === 'Qualified').length, color: 'text-emerald-700' },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-[1rem] p-5 shadow-sm flex flex-col justify-center">
                        <h3 className={`text-2xl font-semibold tracking-tight leading-tight ${s.color}`}>{s.value}</h3>
                        <p className="text-[13px] text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by lead name, phone or outcome..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="py-3 px-5 font-semibold min-w-[160px]">Lead Name</th>
                                <th className="py-3 px-5 font-semibold min-w-[100px]">Type</th>
                                <th className="py-3 px-5 font-semibold min-w-[150px]">Call Time</th>
                                <th className="py-3 px-5 font-semibold min-w-[100px]">Duration</th>
                                <th className="py-3 px-5 font-semibold min-w-[120px]">Outcome</th>
                                <th className="py-3 px-5 font-semibold min-w-[180px]">Recording</th>
                                <th className="py-3 px-5 font-semibold min-w-[100px] text-center">Transcript</th>
                                <th className="py-3 px-5 font-semibold text-right min-w-[80px]">Lead</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {filtered.length > 0 ? filtered.map((call, idx) => (
                                <tr key={call.id || idx} className="hover:bg-indigo-50/30 transition-colors group">

                                    {/* Lead Name */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {call.leadName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{call.leadName}</p>
                                                <p className="text-xs text-gray-400">{call.phone}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="py-3.5 px-5">
                                        <TypeBadge caller={call.caller} />
                                    </td>

                                    {/* Call Time */}
                                    <td className="py-3.5 px-5 text-gray-600 whitespace-nowrap text-xs">{call.time}</td>

                                    {/* Duration */}
                                    <td className="py-3.5 px-5">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                                            <Phone size={11} className="text-gray-400" />
                                            {call.duration || '—'}
                                        </span>
                                    </td>

                                    {/* Outcome */}
                                    <td className="py-3.5 px-5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${outcomeCls(call.outcome)}`}>
                                            {call.outcome || '—'}
                                        </span>
                                    </td>

                                    {/* Recording */}
                                    <td className="py-3.5 px-5">
                                        {call.recording ? (
                                            <RecordingPlayer
                                                call={call}
                                                playing={playingId === (call.id || idx)}
                                                onToggle={() => setPlayingId(playingId === (call.id || idx) ? null : (call.id || idx))}
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">No recording</span>
                                        )}
                                    </td>

                                    {/* Transcript */}
                                    <td className="py-3.5 px-5 text-center">
                                        {call.transcript?.length > 0 ? (
                                            <button
                                                onClick={() => setTranscript({ call, leadName: call.leadName })}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                                                <FileText size={12} /> View
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">—</span>
                                        )}
                                    </td>

                                    {/* Lead link */}
                                    <td className="py-3.5 px-5 text-right">
                                        <button
                                            onClick={() => navigate(`/sales/leads/${call.leadId}`)}
                                            title="Open Lead"
                                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1.5 rounded-lg border border-transparent hover:border-indigo-200 transition-all font-semibold">
                                            <ChevronRight size={13} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Activity size={36} className="text-gray-200" />
                                            <p className="font-medium">No call logs found</p>
                                            <p className="text-xs">Calls placed via the Lead Workspace will appear here</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">{filtered.length} call{filtered.length !== 1 ? 's' : ''} shown</p>
                        {search && <p className="text-xs text-gray-400">Filtered from {allCalls.length} total</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesCallLogs;

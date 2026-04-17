import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import DocumentUploader from './components/DocumentUploader';

const statusIcon = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    submitted: <AlertCircle className="w-4 h-4 text-amber-500" />,
    verified: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
};
const statusBadge = {
    pending: 'bg-gray-100 text-gray-500',
    submitted: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Documents = () => {
    const { documents, customers, updateDocumentStatus } = usePostSales();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filtered = documents.filter(d => {
        const customer = customers.find(c => c.id === d.customerId);
        const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (customer?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || d.status === filter.toLowerCase();
        return matchSearch && matchFilter;
    });

    const counts = { pending: 0, submitted: 0, verified: 0, rejected: 0 };
    documents.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-500" /> Documents
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">{documents.length} total documents</p>
            </div>

            {/* Status summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', count: counts.pending, color: 'bg-gray-50 border-gray-200 text-gray-700' },
                    { label: 'Submitted', count: counts.submitted, color: 'bg-amber-50 border-amber-100 text-amber-700' },
                    { label: 'Verified', count: counts.verified, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                    { label: 'Rejected', count: counts.rejected, color: 'bg-red-50 border-red-100 text-red-700' },
                ].map(s => (
                    <motion.button key={s.label} whileHover={{ y: -2 }} onClick={() => setFilter(s.label)}
                        className={`border rounded-xl p-4 text-left transition-all ${s.color} ${filter === s.label ? 'ring-2 ring-indigo-300' : ''}`}>
                        <p className="text-2xl font-bold">{s.count}</p>
                        <p className="text-sm font-medium mt-0.5">{s.label}</p>
                    </motion.button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                {['All', 'Pending', 'Submitted', 'Verified', 'Rejected'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                ))}
            </div>

            {/* Documents Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase">Document</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Customer</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Type</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Uploaded</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(d => {
                                const customer = customers.find(c => c.id === d.customerId);
                                return (
                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                                <span className="text-gray-700 font-medium truncate max-w-[160px]">{d.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{customer?.name || '—'}</td>
                                        <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{d.type}</span></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {statusIcon[d.status]}
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[d.status]}`}>{d.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDate(d.uploadedAt)}</td>
                                        <td className="px-4 py-3">
                                            {d.status === 'submitted' && (
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => updateDocumentStatus(d.id, 'verified')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Verify</button>
                                                    <span className="text-gray-300">|</span>
                                                    <button onClick={() => updateDocumentStatus(d.id, 'rejected')} className="text-xs text-red-500 hover:text-red-600 font-medium">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No documents found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Upload New Document</h3>
                <p className="text-sm text-gray-400 mb-4">Select a customer's document to upload. Choose the document type for categorization.</p>
                <DocumentUploader customerId={customers[0]?.id || 'unknown'} />
            </div>
        </div>
    );
};

export default Documents;

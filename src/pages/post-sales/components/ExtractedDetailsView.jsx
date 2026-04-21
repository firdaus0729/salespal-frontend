import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Sparkles, AlertCircle, X, CheckCircle2, PenLine, Save } from 'lucide-react';
import { usePostSales } from '../../../context/PostSalesContext';
import { useNavigate } from 'react-router-dom';
import {
    DEFAULT_PREFERRED_LOCALE,
    getAllTimeZones,
    getDefaultTimeZone,
    getLanguageSelectOptions,
    resolveTimeZoneOption
} from '../../../utils/localeOptions';

function postSalesFlowRecommendation(data) {
    if (data.ratingScore >= 8) return 'Positive feedback path: save testimonial and ask referral.';
    if (data.ratingScore >= 5) return 'Neutral feedback path: ask for improvement points and soft referral.';
    if (typeof data.ratingScore === 'number') return 'Negative feedback path: AI resolve first, then owner alert if unresolved.';
    if (data.allRequirementsDone && data.issueRemaining && !data.issueResolved) return 'Issue remains: AI should try resolve, then route to owner intervention.';
    if (data.allRequirementsDone && (!data.issueRemaining || data.issueResolved)) return 'All requirements done: proceed and ask rating 1-10.';
    if (data.documentStatus === 'pending') return 'Request required documents and follow-up on Day 0, Day 2, Day 4.';
    if (data.documentStatus === 'verified' && data.paymentStatus !== 'paid') return 'Documents validated. Continue payment closure branch.';
    if (data.paymentStatus === 'pending') return 'Send payment reminder and retry Day 0, Day 1, Day 3, Day 5, Day 7.';
    if (data.paymentStatus === 'partial' && !data.ownerConfirmed) return 'Collect payment proof and send to owner for verification.';
    if (data.paymentStatus === 'partial' && data.ownerConfirmed) return 'Owner confirmed partial payment. Send second confirmation and update payment.';
    if (data.paymentStatus === 'paid' && data.documentStatus === 'verified') return 'Payment and documents complete. Move to all requirements check.';
    return 'Start follow-up system with call + WhatsApp + SMS/Email backup.';
}

const ExtractedDetailsView = ({ customerData, onCancel }) => {
    const { addCustomer } = usePostSales();
    const navigate = useNavigate();
    const timezoneOptions = getAllTimeZones();
    const languageOptions = getLanguageSelectOptions();

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        name: customerData.name || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        dueDate: customerData.dueDate ? new Date(customerData.dueDate).toISOString().split('T')[0] : '',
        totalDue: customerData.totalDue || customerData.totalAmount || 0,
        paid: customerData.amountPaid || customerData.paidAmount || customerData.paid || 0,
        timezone: resolveTimeZoneOption(customerData.timezone || getDefaultTimeZone(), timezoneOptions),
        preferredLocale: customerData.preferredLocale || DEFAULT_PREFERRED_LOCALE,
        autoLanguageSwitch: customerData.autoLanguageSwitch !== false,
        paymentStatus: customerData.paymentStatus || 'pending',
        documentStatus: customerData.documentStatus || 'pending',
        ownerConfirmed: !!customerData.ownerConfirmed,
        allRequirementsDone: !!customerData.allRequirementsDone,
        issueRemaining: !!customerData.issueRemaining,
        issueResolved: !!customerData.issueResolved,
        ratingScore: typeof customerData.ratingScore === 'number' ? customerData.ratingScore : '',
    });

    const remainingDue = Math.max(0, editableData.totalDue - editableData.paid);

    const handleConfirm = () => {
        addCustomer({
            ...customerData,
            name: editableData.name,
            phone: editableData.phone,
            email: editableData.email,
            dueDate: new Date(editableData.dueDate).toISOString(),
            totalDue: editableData.totalDue,
            amountPaid: editableData.paid,
            timezone: editableData.timezone,
            preferredLocale: editableData.preferredLocale,
            autoLanguageSwitch: editableData.autoLanguageSwitch,
            paymentStatus: editableData.paymentStatus,
            documentStatus: editableData.documentStatus,
            ownerConfirmed: editableData.ownerConfirmed,
            allRequirementsDone: editableData.allRequirementsDone,
            issueRemaining: editableData.issueRemaining,
            issueResolved: editableData.issueResolved,
            ratingScore: editableData.ratingScore === '' ? null : Number(editableData.ratingScore),
        });
        navigate('/post-sales');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="w-full">
            <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors text-sm">
                <X className="w-4 h-4" /> Back to input
            </button>
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_0_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
                <div className="p-0 flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-4 p-8 bg-[#fafdfb] border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Maine yeh samjha hai:</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Please confirm the extracted details</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`bg-[#fafbfc] rounded-xl p-4 flex items-center gap-3 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <User className="w-5 h-5 text-[#3b82f6]" strokeWidth={2} />
                                <div className="w-full">
                                    <p className="text-[12px] text-gray-400 mb-0.5 font-medium">Customer</p>
                                    {isEditing ? (
                                        <input type="text" value={editableData.name} onChange={(e) => setEditableData({ ...editableData, name: e.target.value })} className="w-full text-[15px] font-semibold text-slate-800 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 pb-0.5" />
                                    ) : (
                                        <p className="text-[15px] font-semibold text-slate-800">{editableData.name}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`bg-[#fafbfc] rounded-xl p-4 flex items-center gap-3 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <Phone className="w-5 h-5 text-[#3b82f6]" strokeWidth={2} />
                                <div className="w-full">
                                    <p className="text-[12px] text-gray-400 mb-0.5 font-medium">Phone</p>
                                    {isEditing ? (
                                        <input type="text" value={editableData.phone} onChange={(e) => setEditableData({ ...editableData, phone: e.target.value })} className="w-full text-[15px] font-semibold text-slate-800 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 pb-0.5" />
                                    ) : (
                                        <p className="text-[15px] font-semibold text-slate-800">{editableData.phone}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`bg-[#fafbfc] rounded-xl p-4 flex items-center gap-3 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <Mail className="w-5 h-5 text-[#3b82f6]" strokeWidth={2} />
                                <div className="w-full">
                                    <p className="text-[12px] text-gray-400 mb-0.5 font-medium">Email</p>
                                    {isEditing ? (
                                        <input type="email" value={editableData.email} onChange={(e) => setEditableData({ ...editableData, email: e.target.value })} className="w-full text-[15px] font-semibold text-slate-800 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 pb-0.5 placeholder:text-gray-300" placeholder="Not provided" />
                                    ) : (
                                        <p className="text-[15px] font-semibold text-slate-800">{editableData.email || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            <div className={`bg-[#fafbfc] rounded-xl p-4 flex items-center gap-3 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <Calendar className="w-5 h-5 text-[#3b82f6]" strokeWidth={2} />
                                <div className="w-full">
                                    <p className="text-[12px] text-gray-400 mb-0.5 font-medium">Due Date</p>
                                    {isEditing ? (
                                        <input type="date" value={editableData.dueDate} onChange={(e) => setEditableData({ ...editableData, dueDate: e.target.value })} className="w-full text-[15px] font-semibold text-slate-800 bg-transparent border-b border-indigo-300 focus:outline-none focus:border-indigo-500 pb-0.5" />
                                    ) : (
                                        <p className="text-[15px] font-semibold text-slate-800">{new Date(editableData.dueDate).toLocaleDateString('en-GB')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Amounts */}
                        <div className="bg-[#f8f9fa] rounded-xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between">
                            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-2 text-center border-b md:border-b-0 md:border-r border-gray-200">
                                <p className="text-[13px] text-gray-500 mb-2 font-medium">Total Amount</p>
                                {isEditing ? (
                                    <div className="flex items-center text-xl font-bold text-slate-800 border-b border-indigo-300">
                                        <span>₹</span>
                                        <input type="number" value={editableData.totalDue} onChange={(e) => setEditableData({ ...editableData, totalDue: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })} className="w-24 text-center bg-transparent focus:outline-none" />
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-slate-800">₹{editableData.totalDue?.toLocaleString('en-IN')}</p>
                                )}
                            </div>
                            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-2 text-center border-b md:border-b-0 md:border-r border-gray-200">
                                <p className="text-[13px] text-gray-500 mb-2 font-medium">Paid</p>
                                {isEditing ? (
                                    <div className="flex items-center text-xl font-bold text-[#22c55e] border-b border-indigo-300">
                                        <span>₹</span>
                                        <input type="number" value={editableData.paid} onChange={(e) => setEditableData({ ...editableData, paid: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })} className="w-24 text-center bg-transparent focus:outline-none" />
                                    </div>
                                ) : (
                                    <p className="text-xl font-bold text-[#22c55e]">₹{editableData.paid?.toLocaleString('en-IN')}</p>
                                )}
                            </div>
                            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-2 text-center">
                                <p className="text-[13px] text-gray-500 mb-2 font-medium">Remaining Due</p>
                                <p className="text-xl font-bold text-[#ef4444]">₹{remainingDue.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`bg-[#fafbfc] rounded-xl p-4 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <p className="text-[12px] text-gray-400 mb-2 font-medium">Timezone</p>
                                {isEditing ? (
                                    <select
                                        value={editableData.timezone}
                                        onChange={(e) => setEditableData({ ...editableData, timezone: e.target.value })}
                                        className="w-full text-sm font-semibold text-slate-800 border border-gray-200 rounded-lg px-3 py-2 bg-white"
                                    >
                                        {timezoneOptions.map((tz) => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-[15px] font-semibold text-slate-800">{editableData.timezone}</p>
                                )}
                            </div>
                            <div className={`bg-[#fafbfc] rounded-xl p-4 border ${isEditing ? 'border-indigo-200 bg-white' : 'border-transparent'}`}>
                                <p className="text-[12px] text-gray-400 mb-2 font-medium">Language</p>
                                {isEditing ? (
                                    <select
                                        value={editableData.preferredLocale}
                                        onChange={(e) => setEditableData({ ...editableData, preferredLocale: e.target.value })}
                                        className="w-full text-sm font-semibold text-slate-800 border border-gray-200 rounded-lg px-3 py-2 bg-white"
                                    >
                                        {languageOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-[15px] font-semibold text-slate-800">{languageOptions.find((l) => l.value === editableData.preferredLocale)?.label || editableData.preferredLocale}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[12px] text-indigo-500 font-bold uppercase tracking-wide">Auto Language Switch</p>
                                    <p className="text-sm text-indigo-900">Automatically adapt language during post-sales communication.</p>
                                </div>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editableData.autoLanguageSwitch}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditableData({ ...editableData, autoLanguageSwitch: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select disabled={!isEditing} value={editableData.paymentStatus} onChange={(e) => setEditableData({ ...editableData, paymentStatus: e.target.value })} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                                    <option value="pending">Payment Status: Pending</option>
                                    <option value="partial">Payment Status: Partial</option>
                                    <option value="paid">Payment Status: Paid</option>
                                </select>
                                <select disabled={!isEditing} value={editableData.documentStatus} onChange={(e) => setEditableData({ ...editableData, documentStatus: e.target.value })} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                                    <option value="pending">Document Status: Pending</option>
                                    <option value="submitted">Document Status: Submitted</option>
                                    <option value="verified">Document Status: Verified</option>
                                    <option value="rejected">Document Status: Rejected</option>
                                </select>
                                <label className="text-sm text-slate-700 flex items-center gap-2">
                                    <input type="checkbox" disabled={!isEditing} checked={editableData.ownerConfirmed} onChange={(e) => setEditableData({ ...editableData, ownerConfirmed: e.target.checked })} />
                                    Owner Confirmed
                                </label>
                                <label className="text-sm text-slate-700 flex items-center gap-2">
                                    <input type="checkbox" disabled={!isEditing} checked={editableData.allRequirementsDone} onChange={(e) => setEditableData({ ...editableData, allRequirementsDone: e.target.checked })} />
                                    All Requirements Done
                                </label>
                                <label className="text-sm text-slate-700 flex items-center gap-2">
                                    <input type="checkbox" disabled={!isEditing} checked={editableData.issueRemaining} onChange={(e) => setEditableData({ ...editableData, issueRemaining: e.target.checked })} />
                                    Issue Remaining
                                </label>
                                <label className="text-sm text-slate-700 flex items-center gap-2">
                                    <input type="checkbox" disabled={!isEditing} checked={editableData.issueResolved} onChange={(e) => setEditableData({ ...editableData, issueResolved: e.target.checked })} />
                                    Issue Resolved
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    disabled={!isEditing}
                                    value={editableData.ratingScore}
                                    onChange={(e) => setEditableData({ ...editableData, ratingScore: e.target.value === '' ? '' : Math.max(1, Math.min(10, Number(e.target.value))) })}
                                    placeholder="Rating 1-10"
                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                                />
                            </div>

                            <div className="bg-white border border-indigo-100 rounded-lg p-3">
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide mb-1">AI Next Step</p>
                                <p className="text-sm text-indigo-900">{postSalesFlowRecommendation(editableData)}</p>
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="flex items-center gap-2 text-[#d97706] bg-[#fffbeb] px-4 py-3.5 rounded-xl text-sm border border-[#fef3c7]">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>AI will <strong>NOT</strong> start communication until you confirm. You can edit or cancel at any time.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white mt-auto">
                    <button onClick={onCancel} className="px-5 py-2.5 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                    {isEditing ? (
                        <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 border border-gray-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <PenLine className="w-4 h-4" /> Edit Details
                        </button>
                    )}
                    <button onClick={handleConfirm} disabled={isEditing} className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${isEditing ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[0_4px_12px_-2px_rgba(34,197,94,0.3)]'}`}>
                        <CheckCircle2 className="w-4 h-4" /> Confirm & Start Follow-ups
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ExtractedDetailsView;

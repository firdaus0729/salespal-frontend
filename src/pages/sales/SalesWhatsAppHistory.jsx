import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ExternalLink, DownloadCloud, FileText, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalesWhatsAppHistory = () => {
    const { leads } = useSales();
    const navigate = useNavigate();
    const [actionModal, setActionModal] = useState(null);

    // Extract all WhatsApp conversations from leads
    const allWhatsApp = leads.reduce((acc, lead) => {
        if (lead.communications) {
            const chats = lead.communications.filter(c => c.type === 'whatsapp').map(c => ({
                ...c,
                leadId: lead.id,
                leadName: lead.name,
                phone: lead.phone
            }));
            acc.push(...chats);
        }
        return acc;
    }, []);

    const renderActionModal = () => {
        if (!actionModal) return null;
        const { payload } = actionModal;

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
                    onClick={() => setActionModal(null)}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 16 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md border border-gray-200 flex flex-col h-[600px] max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="bg-[#075E54] text-white p-4 flex items-center gap-4 shadow-md z-10 shrink-0">
                            <button onClick={() => setActionModal(null)} className="text-white/80 hover:text-white transition-colors p-1"><X size={20} /></button>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm leading-tight">{payload.leadName}</h3>
                                <p className="text-xs text-white/70">{payload.phone}</p>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 bg-[#ECE5DD] p-4 overflow-y-auto space-y-4 flex flex-col pt-6">
                            <div className="flex justify-center mb-2">
                                <span className="bg-[#E1F3FB] text-gray-600 shadow-sm text-[11px] font-bold px-3 py-1 rounded-lg">Today</span>
                            </div>
                            {payload.history && payload.history.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'Lead' ? 'self-start' : 'self-end'} max-w-[85%]`}>
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm text-gray-800 ${msg.sender === 'Lead'
                                            ? 'bg-white rounded-tl-none'
                                            : 'bg-[#DCF8C6] rounded-tr-none'
                                        }`}>
                                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>

                                        {msg.attachment && (
                                            <div className="mt-2 text-xs flex items-center gap-1.5 pt-2 border-t border-black/10 opacity-80">
                                                <FileText size={12} />
                                                <span className="truncate">{msg.attachment}</span>
                                                <DownloadCloud size={12} className="ml-auto cursor-pointer" />
                                            </div>
                                        )}

                                        <div className={`text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1 ${msg.sender === 'Lead' ? 'text-gray-400' : ''}`}>
                                            {msg.time} {msg.sender !== 'Lead' && <Check size={12} className="text-blue-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area (Visual Only) */}
                        <div className="p-3 bg-gray-100 flex items-center gap-3 shrink-0">
                            <div className="bg-white rounded-full flex-1 flex items-center px-4 py-2 shadow-sm border border-gray-200">
                                <input type="text" placeholder="Type a message..." className="w-full text-sm outline-none bg-transparent" disabled />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="font-sans text-gray-900 pb-12">
            {renderActionModal()}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-4 border-b border-gray-100 mb-6">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors mb-1"
                    >
                        <ArrowLeft size={13} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        WhatsApp Conversations
                    </h1>
                    <p className="text-gray-500 mt-1">Review full automated WhatsApp interactions and threads.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allWhatsApp.length > 0 ? allWhatsApp.map((chat, idx) => {
                    const latestMessage = chat.history?.[chat.history.length - 1];
                    const attachmentsCount = chat.history?.filter(h => h.attachment).length || 0;

                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-200 transition-all cursor-pointer flex flex-col" onClick={() => setActionModal({ payload: chat })}>
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{chat.leadName}</h3>
                                    <p className="text-xs text-gray-500">{chat.phone}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                    <MessageSquare size={18} />
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                                    <span>Latest Message</span>
                                    <span>{latestMessage?.time || 'N/A'}</span>
                                </div>
                                <p className="text-sm text-gray-700 italic line-clamp-3 leading-relaxed">
                                    "{latestMessage?.text || 'No messages'}"
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 mt-auto">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        <MessageSquare size={14} />
                                        {chat.history?.length || 0} Msgs
                                    </span>
                                    {attachmentsCount > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <FileText size={14} />
                                            {attachmentsCount} File(s)
                                        </span>
                                    )}
                                </div>
                                <button className="text-green-600 hover:text-green-700 hover:underline flex items-center gap-1" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/sales/leads/${chat.leadId}`);
                                }}>
                                    Profile <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-16 text-center text-gray-500 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                        No WhatsApp conversations active.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesWhatsAppHistory;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageCircle, AlertCircle, Clock, CalendarDays, MoreVertical, Phone, Mail, Bell, Loader2 } from 'lucide-react';
import api from '../../lib/api';

const toTitle = (value = '') => String(value).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const SupportTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("Open");
    const [toastMessage, setToastMessage] = useState("");
    const [assignedAgent, setAssignedAgent] = useState("Unassigned");
    const [customerFeedback, setCustomerFeedback] = useState(null);
    const [activeTab, setActiveTab] = useState("customer");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const agents = [
        "Unassigned",
        "Sarah Johnson",
        "Mike Chen",
        "Alex Rivera",
        "You"
    ];

    useEffect(() => {
        async function fetchTicketDetails() {
            try {
                const data = await api.get(`/support/${id}`);
                if (!data?.id) throw new Error('Ticket not found');
                setTicket(data);
                setMessages(Array.isArray(data?.comments) ? data.comments : []);
                setStatus(toTitle(data?.status || 'open'));
                setError('');
            } catch (err) {
                console.error("Failed to fetch ticket details:", err);
                setError(err?.message || 'Failed to fetch ticket details');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchTicketDetails();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        const normalized =
            newStatus === 'In Progress' ? 'in_progress'
            : newStatus === 'Resolved' ? 'resolved'
            : newStatus === 'Open' ? 'open'
            : newStatus;

        try {
            setUpdatingStatus(true);
            setStatus(toTitle(normalized));
            await api.put(`/support/${id}`, { status: normalized });
            setToastMessage("Status updated successfully");
        } catch (error) {
            console.error("Failed to update status", error);
            setToastMessage("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleEscalate = async () => {
        try {
            setUpdatingStatus(true);
            await api.put(`/support/${id}`, { status: 'in_progress', priority: 'urgent' });
            setStatus('In Progress');
            setToastMessage('Ticket escalated');
        } catch (error) {
            setToastMessage(error?.message || 'Failed to escalate ticket');
        } finally {
            setUpdatingStatus(false);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const handleSendReply = async () => {
        const content = replyText.trim();
        if (!content) return;
        try {
            setSending(true);
            const created = await api.post(`/support/${id}/comments`, { content });
            setMessages((prev) => [...prev, created]);
            setReplyText('');
            setToastMessage('Reply sent');
        } catch (error) {
            setToastMessage(error?.message || 'Failed to send reply');
        } finally {
            setSending(false);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open':
                return 'bg-yellow-100 text-yellow-700';
            case 'In Progress':
                return 'bg-blue-100 text-blue-700';
            case 'Resolved':
                return 'bg-green-100 text-green-700';
            case 'Escalated':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getChannelIcon = (channel) => {
        switch(channel.toLowerCase()) {
            case "whatsapp":
                return <MessageCircle size={16} />;
            case "call":
                return <Phone size={16} />;
            case "email":
                return <Mail size={16} />;
            case "notification":
                return <Bell size={16} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }
    
    // Safely extract ticket properties
    const md = ticket?.metadata || {};
    const customerName = md.customerName || 'Unknown Customer';
    const customerEmail = md.customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const channel = md.channel || 'Email';
    const category = toTitle(ticket?.category || 'Uncategorized');
    const priority = toTitle(ticket?.priority || 'Medium');

    return (
        <div className="w-full px-6 lg:px-8 xl:px-10 space-y-6">
            {/* Back button */}
            <button 
                onClick={() => navigate('/support/tickets')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
            </button>

            {/* Page Header (Metadata Card) */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Ticket #{ticket?.ticketNumber || `TCK-${String(id || '').slice(0, 8)}`}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1.5 mr-2">
                            <User className="w-4 h-4 text-gray-400" /> 
                            <span className="font-medium text-gray-900">{customerName}</span>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {getChannelIcon(channel)}
                            {channel}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{category}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                             priority === 'High' || priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                             priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-blue-100 text-blue-700'
                        }`}>
                            {priority} Priority
                        </span>
                        <span className="text-xs font-medium flex items-center gap-1.5 ml-1">
                            <Clock className="w-3.5 h-3.5" /> {ticket?.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
                <div className="mt-2 sm:mt-0">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusStyle(status)}`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-10 gap-6">
                {/* Left Column (Conversation & Actions) */}
                <div className="col-span-7 space-y-6">
                    {/* Conversation Thread */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col h-[70vh] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-medium text-gray-700">Conversation</h2>
                    <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                    {customerName} &bull; {channel} &bull; {category}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                    <div className="text-center mb-4">
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">{ticket?.date || 'Today'}</span>
                    </div>

                    {messages.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-6">No messages in this ticket yet.</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={msg.id || index} className={`flex flex-col ${msg.is_internal ? 'items-end' : 'items-start'}`}>
                                {!msg.is_internal && index === 0 && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                        <MessageCircle size={12} />
                                        {channel}
                                    </div>
                                )}
                            <div className={`text-sm ${
                                msg.is_internal
                                ? 'max-w-[70%] ml-auto bg-blue-600 text-white rounded-xl p-3 wrap-break-word shadow-sm' 
                                : 'max-w-[70%] bg-gray-100 text-gray-800 rounded-xl p-3 wrap-break-word shadow-sm'
                            }`}>
                                {msg.content || msg.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {msg.author_name || (msg.is_internal ? 'Support Agent' : customerName)} &bull; {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'now'}
                            </div>
                        </div>
                        ))
                    )}
                </div>

                {/* Reply Box Inline */}
                <div className="border-t border-gray-200 pt-3 mt-3 flex items-end gap-3 flex-wrap sticky bottom-0 bg-white pb-2 z-10">
                    <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        placeholder="Type your reply..."
                    />
                    <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || sending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm shrink-0 disabled:opacity-60"
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                    
                    {/* Ticket Actions */}
                    <div className="flex items-center gap-2 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                        <button 
                            onClick={() => handleStatusChange("In Progress")}
                            disabled={updatingStatus}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
                        >
                            Mark In Progress
                        </button>
                        <button 
                            onClick={() => handleStatusChange("Resolved")}
                            disabled={updatingStatus}
                            className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
                        >
                            Resolve Ticket
                        </button>
                        <button 
                            onClick={handleEscalate}
                            disabled={updatingStatus}
                            className="border border-red-200 text-red-600 bg-red-50 px-4 py-2 rounded-md text-sm disabled:opacity-60"
                        >
                            Escalate Ticket
                        </button>
                    </div>
                </div>
                {toastMessage && <p className="text-xs text-green-600 mt-2">{toastMessage}</p>}
                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>

            {/* Customer Feedback Card (Visible only when Resolved) */}
            {status === "Resolved" && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">Customer Feedback</h2>
                    <p className="text-sm text-gray-700 mb-4">Was this issue resolved successfully?</p>
                    
                    {customerFeedback ? (
                        <div className="text-sm font-medium text-gray-900">
                            Customer Satisfaction: {
                                customerFeedback === 'positive' ? '😊 Positive' :
                                customerFeedback === 'neutral' ? '😐 Neutral' : 
                                '😞 Negative'
                            }
                        </div>
                    ) : (
                        <div className="flex gap-3 text-sm">
                            <button 
                                onClick={() => setCustomerFeedback("positive")}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                            >
                                😊 Positive
                            </button>
                            <button 
                                onClick={() => setCustomerFeedback("neutral")}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                            >
                                😐 Neutral
                            </button>
                            <button 
                                onClick={() => setCustomerFeedback("negative")}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                                😞 Negative
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="col-span-3 space-y-6 sticky top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h2 className="text-sm font-medium text-gray-700 mb-3">Context</h2>
                
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 text-sm mb-3">
                    <button 
                        onClick={() => setActiveTab('customer')}
                        className={`pb-2 cursor-pointer ${activeTab === 'customer' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Customer
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`pb-2 cursor-pointer ${activeTab === 'ai' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        AI Analysis
                    </button>
                    <button 
                        onClick={() => setActiveTab('timeline')}
                        className={`pb-2 cursor-pointer ${activeTab === 'timeline' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Timeline
                    </button>
                    <button 
                        onClick={() => setActiveTab('agent')}
                        className={`pb-2 cursor-pointer ${activeTab === 'agent' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Agent
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'customer' && (
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {customerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{customerName}</p>
                                <p className="text-xs text-gray-500">{customerEmail}</p>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500">Total Tickets</p>
                                <p className="font-medium text-gray-900">{customer?.totalTickets || 1}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Resolved</p>
                                <p className="font-medium text-gray-900">{customer?.resolvedTickets || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Open</p>
                                <p className="font-medium text-gray-900">{customer?.openTickets || 1}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Satisfaction</p>
                                <p className="font-medium text-green-600">{customer?.satisfaction || 'N/A'}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3 border-t border-gray-100 pt-3">
                            Customer since {customer?.since || '2022'}
                        </p>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="mt-4">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Language</span>
                                <span className="text-sm font-medium text-gray-900">{ticket?.aiAnalysis?.language || 'English'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Intent</span>
                                <span className="text-sm font-medium text-gray-900">{ticket?.aiAnalysis?.intent || category}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Sentiment</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    ticket?.aiAnalysis?.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 
                                    ticket?.aiAnalysis?.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {ticket?.aiAnalysis?.sentiment || 'Neutral'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Detected Tone</span>
                                <span className="text-sm font-medium text-gray-900">{ticket?.aiAnalysis?.tone || 'Neutral'}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${ticket?.aiAnalysis?.confidence || 85}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">AI Confidence: {ticket?.aiAnalysis?.confidence || 85}%</p>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <span className="text-xs font-medium text-gray-900 block mb-0.5">Recommended Tone:</span>
                            <p className="text-sm text-gray-600">{ticket?.aiAnalysis?.recommendedTone || 'Helpful and professional'}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="border-l border-gray-200 pl-4 space-y-2 ml-1 mt-4">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Ticket Created</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Assigned to Agent</p>
                                <p className="text-xs text-gray-500">1 hour ago</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Marked In Progress</p>
                                <p className="text-xs text-gray-500">45 minutes ago</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">Resolved</p>
                                <p className="text-xs text-gray-400">Pending</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'agent' && (
                    <div className="mt-4">
                        <select 
                            value={assignedAgent}
                            onChange={(e) => setAssignedAgent(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full"
                        >
                            {agents.map((agent) => (
                                <option key={agent} value={agent}>
                                    {agent}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">Assign this ticket to a support agent.</p>
                        {assignedAgent !== "Unassigned" && (
                            <p className="text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                                Assigned to <span className="font-medium">{assignedAgent}</span>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
            </div>
        </div>
    );
};

// Lucide icon missing in requirements but used for metadata:
const Folder = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>);

export default SupportTicketDetails;

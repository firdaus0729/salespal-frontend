//support tickets
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Phone, Mail, MessageCircle, Bell, Loader2, Plus, X } from 'lucide-react';
import api from '../../lib/api';

const categories = ['All', 'Queries', 'Complaints', 'Status', 'Feedback', 'Escalations'];
const channelOptions = ['Email', 'WhatsApp', 'Call', 'Notification', 'Chat'];
const categoryOptions = ['Queries', 'Complaints', 'Status', 'Feedback', 'Escalations'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

const toTitle = (value = '') => String(value).replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const normalizeTicket = (ticket = {}) => {
    const md = ticket.metadata || {};
    return {
        ...ticket,
        customer: {
            name: md.customerName || md.customer?.name || 'Unknown Customer',
            email: md.customerEmail || md.customer?.email || '',
        },
        channel: md.channel || ticket.channel || 'Email',
        category: toTitle(ticket.category || md.category || 'Queries'),
        priority: toTitle(ticket.priority || 'medium'),
        status: toTitle(ticket.status || 'open'),
        date: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '',
    };
};

const SupportTickets = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const statusFilter = searchParams.get("status");
    const priorityFilter = searchParams.get("priority");

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        customerName: '',
        customerEmail: '',
        channel: 'Email',
        category: 'Queries',
        priority: 'medium',
        subject: '',
        description: '',
    });

    useEffect(() => {
        async function fetchTickets() {
            try {
                const data = await api.get('/support');
                const normalized = Array.isArray(data) ? data.map(normalizeTicket) : [];
                setTickets(normalized);
                setError('');
            } catch (error) {
                console.error("Failed to fetch support tickets:", error);
                setTickets([]);
                setError(error?.message || 'Failed to fetch support tickets');
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        const matchesFilter = activeFilter === 'All' || ticket.category === activeFilter;

        let matchesStatus = true;
        if (statusFilter) {
            matchesStatus = ticket.status?.toLowerCase() === statusFilter.toLowerCase();
        }

        let matchesPriority = true;
        if (priorityFilter) {
            matchesPriority = ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();
        }

        const searchLower = searchQuery.toLowerCase();

        // Defensive customer parsing
        const customerName = ticket.customer?.name || (typeof ticket.customer === 'string' ? ticket.customer : '');

        const matchesSearch = customerName.toLowerCase().includes(searchLower) || ticket.id?.toString().includes(searchLower);
        return matchesFilter && matchesSearch && matchesStatus && matchesPriority;
    });

    const getFilterBadgeLabel = () => {
        if (statusFilter === 'open') return 'Showing Open Tickets';
        if (statusFilter === 'resolved') return 'Showing Resolved Tickets';
        if (priorityFilter === 'high') return 'Showing Escalations';
        return null;
    };
    const filterBadgeLabel = getFilterBadgeLabel();

    const handleTicketClick = (id) => {
        navigate(`/support/tickets/${id}`);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!form.subject.trim()) return;
        setCreating(true);
        try {
            const created = await api.post('/support', {
                subject: form.subject.trim(),
                description: form.description.trim() || null,
                priority: form.priority,
                category: form.category.toLowerCase(),
                metadata: {
                    customerName: form.customerName.trim() || 'Unknown Customer',
                    customerEmail: form.customerEmail.trim() || '',
                    channel: form.channel,
                },
            });

            const normalized = normalizeTicket(created);
            setTickets((prev) => [normalized, ...prev]);
            setCreateOpen(false);
            setForm({
                customerName: '',
                customerEmail: '',
                channel: 'Email',
                category: 'Queries',
                priority: 'medium',
                subject: '',
                description: '',
            });
            navigate(`/support/tickets/${normalized.id}`);
        } catch (err) {
            setError(err?.message || 'Failed to create ticket');
        } finally {
            setCreating(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open':
                return 'bg-yellow-100 text-yellow-700';
            case 'Resolved':
                return 'bg-green-100 text-green-700';
            case 'Escalated':
                return 'bg-red-100 text-red-700';
            case 'In Progress':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High':
            case 'Urgent':
                return 'bg-red-100 text-red-700';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'Low':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getChannelIconWithStyle = (channel) => {
        switch (channel.toLowerCase()) {
            case 'whatsapp':
                return <MessageCircle size={16} className="text-green-600" />;
            case 'phone':
            case 'call':
                return <Phone size={16} className="text-blue-600" />;
            case 'email':
                return <Mail size={16} className="text-gray-600" />;
            case 'notification':
                return <Bell size={16} className="text-yellow-600" />;
            case 'chat':
                return <MessageCircle size={16} className="text-green-600" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Support Tickets</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all customer support requests.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> New Ticket
                </button>
            </div>

            {createOpen && (
                <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Create Ticket</h2>
                            <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-5 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} placeholder="Customer name" className="border border-gray-200 rounded-md px-3 py-2 text-sm" />
                                <input value={form.customerEmail} onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))} placeholder="Customer email" className="border border-gray-200 rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <select value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))} className="border border-gray-200 rounded-md px-3 py-2 text-sm">
                                    {channelOptions.map((c) => <option key={c}>{c}</option>)}
                                </select>
                                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="border border-gray-200 rounded-md px-3 py-2 text-sm">
                                    {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                                </select>
                                <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="border border-gray-200 rounded-md px-3 py-2 text-sm">
                                    {priorityOptions.map((p) => <option key={p} value={p}>{toTitle(p)}</option>)}
                                </select>
                            </div>
                            <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Subject*" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" required />
                            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={4} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none" />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                                <button disabled={creating || !form.subject.trim()} type="submit" className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                                    {creating ? 'Creating...' : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters Bar & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={
                                activeFilter === category
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm'
                                    : 'border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md text-sm hover:bg-gray-50'
                            }
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Tickets Table */}
            <div className="space-y-4">
                {error && (
                    <div className="px-4 py-3 rounded-md text-sm bg-red-50 border border-red-200 text-red-700">
                        {error}
                    </div>
                )}
                {filterBadgeLabel && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            {filterBadgeLabel}
                        </span>
                        <button
                            onClick={() => navigate('/support/tickets')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => handleTicketClick(ticket.id)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-700"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">{ticket.ticketNumber || `TCK-${String(ticket.id).slice(0, 8)}`}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <p>{ticket.customer?.name || ticket.customer || 'Unknown Customer'}</p>
                                                <p className="text-xs text-gray-500">{ticket.customer?.email || ticket.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getChannelIconWithStyle(ticket.channel || 'Email')}
                                                <span>{ticket.channel || 'Email'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {ticket.category}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityStyle(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {ticket.date || new Date().toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;

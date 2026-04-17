//support tickets
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Phone, Mail, MessageCircle, Bell, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { mockTickets } from './mockSupportData';

const categories = ['All', 'Queries', 'Complaints', 'Status', 'Feedback', 'Escalations'];

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

    useEffect(() => {
        async function fetchTickets() {
            try {
                const data = await api.get('/support/tickets');
                setTickets(data?.length ? data : mockTickets);
            } catch (error) {
                console.error("Failed to fetch support tickets:", error);
                setTickets(mockTickets);
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
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Support Tickets</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage all customer support requests.</p>
            </div>

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
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            TCK-{ticket.id}
                                        </td>
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

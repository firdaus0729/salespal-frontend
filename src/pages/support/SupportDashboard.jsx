import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowUpRight, Ticket, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import { mockTickets } from './mockSupportData';


const SupportDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                // Fetch aggregate dashboard metrics directly
                const data = await api.get('/support/analytics');
                
                if (!data || !data.recentTickets || data.recentTickets.length === 0) {
                    const openTickets = mockTickets.filter(t => ["Open", "In Progress"].includes(t.status)).length;
                    const resolvedTickets = mockTickets.filter(t => t.status === "Resolved").length;
                    const escalations = mockTickets.filter(t => t.status === "Escalated").length;

                    setDashboardData({
                        metrics: [
                            { title: 'Open Tickets', value: openTickets.toString() },
                            { title: 'Resolved Tickets', value: resolvedTickets.toString() },
                            { title: 'Escalations', value: escalations.toString() },
                            { title: 'Avg Response Time', value: '2h' },
                        ],
                        categories: [
                            { title: 'Queries', count: mockTickets.filter(t => t.category === 'Queries').length },
                            { title: 'Complaints', count: mockTickets.filter(t => t.category === 'Complaints').length }
                        ],
                        recentTickets: mockTickets
                    });
                } else {
                    setDashboardData(data);
                }
            } catch (err) {
                console.error("Failed to fetch support dashboard data:", err);
                
                const openTickets = mockTickets.filter(t => ["Open", "In Progress"].includes(t.status)).length;
                const resolvedTickets = mockTickets.filter(t => t.status === "Resolved").length;
                const escalations = mockTickets.filter(t => t.status === "Escalated").length;

                setDashboardData({
                    metrics: [
                        { title: 'Open Tickets', value: openTickets.toString() },
                        { title: 'Resolved Tickets', value: resolvedTickets.toString() },
                        { title: 'Escalations', value: escalations.toString() },
                        { title: 'Avg Response Time', value: '2h' },
                    ],
                    categories: [
                        { title: 'Queries', count: mockTickets.filter(t => t.category === 'Queries').length },
                        { title: 'Complaints', count: mockTickets.filter(t => t.category === 'Complaints').length }
                    ],
                    recentTickets: mockTickets
                });
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    const getMetricConfig = (title) => {
        switch (title) {
            case 'Open Tickets':
                return { icon: <Ticket className="w-5 h-5 text-blue-600" />, style: 'bg-blue-100' };
            case 'Resolved Tickets':
                return { icon: <CheckCircle className="w-5 h-5 text-green-600" />, style: 'bg-green-100' };
            case 'Escalations':
                return { icon: <AlertCircle className="w-5 h-5 text-red-600" />, style: 'bg-red-100' };
            case 'Avg Response Time':
                return { icon: <Clock className="w-5 h-5 text-yellow-600" />, style: 'bg-yellow-100' };
            default:
                return { icon: <Ticket className="w-5 h-5 text-gray-600" />, style: 'bg-gray-100' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const { 
        metrics = [
            { title: 'Open Tickets', value: '0' },
            { title: 'Resolved Tickets', value: '0' },
            { title: 'Escalations', value: '0' },
            { title: 'Avg Response Time', value: '0h' },
        ], 
        categories = [], 
        recentTickets = [] 
    } = dashboardData || {};
    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="space-y-3">
                <h1 className="text-xl font-semibold text-gray-900">Support Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor support activity and customer requests.</p>
            </div>

            {/* Support Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const { icon, style } = getMetricConfig(metric.title);
                    return (
                        <div 
                            key={index} 
                            onClick={() => {
                                if (metric.title === 'Open Tickets') {
                                    navigate('/support/tickets?status=open');
                                } else if (metric.title === 'Resolved Tickets') {
                                    navigate('/support/tickets?status=resolved');
                                } else if (metric.title === 'Escalations') {
                                    navigate('/support/tickets?priority=high');
                                } else if (metric.title === 'Avg Response Time') {
                                    navigate('/support/analytics#response-time');
                                }
                            }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-lg ${style}`}>
                                    {icon}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="mt-4 text-2xl font-semibold text-gray-900">
                                {metric.value}
                            </div>

                            <div className="text-sm text-gray-500 mt-1">
                                {metric.title}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Ticket Categories Section */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-gray-700">Ticket Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((category, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                            <h3 className="text-sm text-gray-500">{category.title}</h3>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{category.count}</p>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full py-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No category data available.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-sm font-medium text-gray-700">Recent Support Requests</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 text-sm text-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>{ticket.customer?.name || ticket.customer || 'Unknown Customer'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>{ticket.channel || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>{ticket.category || 'Uncategorized'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-700' :
                                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                            ticket.status === 'Escalated' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {ticket.date || new Date().toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {recentTickets.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No recent tickets available.
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

export default SupportDashboard;

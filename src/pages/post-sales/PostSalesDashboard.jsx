import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import MetricCard from '../../components/postSales/MetricCard';
import AIInsightBanner from '../../components/postSales/AIInsightBanner';
import CustomersTable from '../../components/postSales/CustomersTable';

const formatCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a);

const PostSalesDashboard = () => {
    const navigate = useNavigate();
    const { customers, payments } = usePostSales();

    // Metrics calculation
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // Due Today: customers where dueDate === today
    const dueToday = customers.filter(c => c.dueDate === todayStr);

    // Upcoming: dueDate within next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`;

    const upcoming = customers.filter(c => c.dueDate > todayStr && c.dueDate <= nextWeekStr);

    // Confirmations Pending: status === "pending"
    const confirmPending = customers.filter(c => c.status === 'pending');

    // Collected This Week: sum(payments where paymentDate within last 7 days) and customer count
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = `${lastWeek.getFullYear()}-${pad(lastWeek.getMonth() + 1)}-${pad(lastWeek.getDate())}`;

    const collectedPayments = payments.filter(p => p.paymentDate >= lastWeekStr && p.paymentDate <= todayStr);
    const sumCollected = collectedPayments.reduce((sum, p) => sum + p.amount, 0);
    const collectedCustomerIds = new Set(collectedPayments.map(p => p.customerId));

    const sumDueToday = dueToday.reduce((sum, c) => sum + c.remaining, 0);
    const sumUpcoming = upcoming.reduce((sum, c) => sum + c.remaining, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Post-Sales Dashboard
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Track and manage your post-sales follow-ups</p>
                </div>
                <button onClick={() => navigate('/post-sales/customers')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 w-fit">
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<Calendar className="w-5 h-5 text-red-600" />} color="bg-red-50" label="Due Today" value={dueToday.length} sub={formatCurrency(sumDueToday)} textcolor="text-red-600" />
                <MetricCard icon={<Clock className="w-5 h-5 text-amber-600" />} color="bg-amber-50" label="Upcoming (7 days)" value={upcoming.length} sub={formatCurrency(sumUpcoming)} textcolor="text-amber-600" />
                <MetricCard icon={<AlertCircle className="w-5 h-5 text-blue-600" />} color="bg-blue-50" label="Confirmations Pending" value={confirmPending.length} sub="Awaiting your action" textcolor="text-gray-400 font-medium" />
                <MetricCard icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50" label="Collected This Week" value={formatCurrency(sumCollected)} sub={`${collectedCustomerIds.size} customers`} textcolor="text-gray-400 font-medium" />
            </div>

            {/* AI Insight Banner */}
            <AIInsightBanner />

            {/* Customers to Follow Up Table */}
            <CustomersTable />
        </div>
    );
};

export default PostSalesDashboard;

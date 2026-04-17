import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import PaymentReminderCard from './components/PaymentReminderCard';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a);

const Payments = () => {
    const { payments, customers, updatePaymentStatus } = usePostSales();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = payments.filter(p => p.status !== 'paid' && new Date(p.dueDate) < new Date()).length;

    const filtered = payments.filter(p => {
        const customer = customers.find(c => c.id === p.customerId);
        const matchSearch = !search || p.invoiceId.toLowerCase().includes(search.toLowerCase()) || (customer?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || p.status === filter.toLowerCase() || (filter === 'Overdue' && p.status !== 'paid' && new Date(p.dueDate) < new Date());
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-indigo-500" /> Payments
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Track invoices and payment status</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invoiced', value: formatCurrency(total), icon: <CreditCard className="w-5 h-5 text-indigo-600" />, color: 'bg-indigo-50' },
                    { label: 'Paid', value: formatCurrency(totalPaid), icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50' },
                    { label: 'Pending', value: formatCurrency(totalPending), icon: <Clock className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
                    { label: 'Overdue', value: overdueCount + ' invoices', icon: <AlertCircle className="w-5 h-5 text-red-600" />, color: 'bg-red-50' },
                ].map(s => (
                    <motion.div key={s.label} whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                {['All', 'Paid', 'Pending', 'Overdue'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
                ))}
            </div>

            {/* Payment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(p => {
                    const customer = customers.find(c => c.id === p.customerId);
                    return (
                        <div key={p.id}>
                            {customer && <p className="text-xs font-semibold text-gray-500 mb-1.5 ml-1">{customer.name}</p>}
                            <PaymentReminderCard payment={p} onMarkPaid={() => updatePaymentStatus(p.id, 'paid')} />
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400 text-sm">No payments found.</div>
                )}
            </div>
        </div>
    );
};

export default Payments;

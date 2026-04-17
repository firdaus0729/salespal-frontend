import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePostSales } from '../../context/PostSalesContext';
import HealthScoreBadge from './components/HealthScoreBadge';
import OnboardingProgress from './components/OnboardingProgress';

const statusColors = {
    'New': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    'Onboarding': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'Active': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'At Risk': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    'Renewal Due': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    'Churned': 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const STATUSES = ['All', 'New', 'Onboarding', 'Active', 'At Risk', 'Renewal Due', 'Churned'];
const PLANS = ['All', 'Enterprise', 'Pro', 'Starter'];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Customers = () => {
    const navigate = useNavigate();
    const { customers, onboardingFlows } = usePostSales();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [planFilter, setPlanFilter] = useState('All');

    const filtered = customers.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchPlan = planFilter === 'All' || c.plan === planFilter;
        return matchSearch && matchStatus && matchPlan;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" /> Customers
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">{customers.length} total customers</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 w-fit">
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                    className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {PLANS.map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Plan</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Health</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">Renewal</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">Onboarding</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filtered.map((c, i) => {
                                    const flow = onboardingFlows[c.id] || { stepIndex: 0, completedSteps: [] };
                                    return (
                                        <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            onClick={() => navigate(`/post-sales/customers/${c.id}`)}
                                            className="hover:bg-indigo-50/40 cursor-pointer transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                                                        <p className="text-xs text-gray-400">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{c.plan}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                                            </td>
                                            <td className="px-4 py-4 hidden lg:table-cell w-36">
                                                <HealthScoreBadge score={c.healthScore} />
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500 hidden xl:table-cell">{formatDate(c.renewalDate)}</td>
                                            <td className="px-4 py-4 hidden xl:table-cell w-48">
                                                {(c.status === 'Onboarding' || c.status === 'New') && (
                                                    <OnboardingProgress completedSteps={flow.completedSteps} stepIndex={flow.stepIndex} compact />
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No customers match your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;

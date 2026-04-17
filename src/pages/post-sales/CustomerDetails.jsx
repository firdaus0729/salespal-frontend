import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Mail, Phone, Building2, Calendar, User, CheckSquare, Plus } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';
import HealthScoreBadge from './components/HealthScoreBadge';
import OnboardingProgress from './components/OnboardingProgress';
import CustomerTimeline from './components/CustomerTimeline';
import PaymentReminderCard from './components/PaymentReminderCard';
import DocumentUploader from './components/DocumentUploader';
import OnboardingFlow from './onboarding/OnboardingFlow';

const statusColors = {
    'New': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    'Onboarding': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'Active': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'At Risk': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    'Renewal Due': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    'Churned': 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const docStatusColors = { pending: 'text-gray-400', submitted: 'text-amber-600', verified: 'text-emerald-600', rejected: 'text-red-600' };

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCustomer, onboardingFlows, documents, payments, updatePaymentStatus, addDocument } = usePostSales();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [tab, setTab] = useState('overview');

    const customer = getCustomer(id);
    if (!customer) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
                <p className="text-lg font-medium mb-2">Customer not found</p>
                <button onClick={() => navigate('/post-sales/customers')} className="text-indigo-600 hover:underline text-sm">← Back to Customers</button>
            </div>
        </div>
    );

    const flow = (onboardingFlows || {})[customer.id] || { stepIndex: 0, completedSteps: [] };
    const custDocs = documents.filter(d => d.customerId === customer.id);
    const custPayments = payments.filter(p => p.customerId === customer.id);
    const TABS = ['overview', 'documents', 'payments', 'timeline'];

    return (
        <div className="space-y-6">
            {/* Back + header */}
            <div className="flex items-start gap-4">
                <button onClick={() => navigate('/post-sales/customers')}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-200">
                            {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {customer.name}
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[customer.status] || 'bg-gray-100'}`}>{customer.status}</span>
                            </h1>
                            <p className="text-sm text-gray-500 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{customer.company}</p>
                        </div>
                    </div>
                    {(customer.status === 'New' || customer.status === 'Onboarding') && (
                        <button onClick={() => setShowOnboarding(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 w-fit">
                            <Play className="w-3.5 h-3.5" /> Onboard Now
                        </button>
                    )}
                </div>
            </div>

            {/* Info cards + health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">Contact Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <Mail className="w-4 h-4 text-indigo-400" />, label: 'Email', value: customer.email },
                            { icon: <Phone className="w-4 h-4 text-indigo-400" />, label: 'Phone', value: customer.phone },
                            { icon: <Calendar className="w-4 h-4 text-indigo-400" />, label: 'Start Date', value: formatDate(customer.startDate) },
                            { icon: <Calendar className="w-4 h-4 text-amber-400" />, label: 'Renewal Date', value: formatDate(customer.renewalDate) },
                            { icon: <User className="w-4 h-4 text-violet-400" />, label: 'Account Mgr', value: customer.accountManager },
                            { icon: <CheckSquare className="w-4 h-4 text-emerald-400" />, label: 'Plan', value: customer.plan },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="mt-0.5">{item.icon}</div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                                    <p className="text-sm text-gray-700 font-medium">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-3">Health Score</h3>
                        <HealthScoreBadge score={customer.healthScore} showBar />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-3">Onboarding Progress</h3>
                        <OnboardingProgress completedSteps={flow.completedSteps} stepIndex={flow.stepIndex} compact />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {tab === 'overview' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
                        <CustomerTimeline timeline={customer.timeline || []} />
                    </div>
                )}
                {tab === 'documents' && (
                    <div className="space-y-4">
                        {custDocs.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Document</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Type</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Status</th>
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">Uploaded</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {custDocs.map(d => (
                                            <tr key={d.id}>
                                                <td className="px-4 py-3 font-medium text-gray-700">{d.name}</td>
                                                <td className="px-4 py-3 text-gray-500">{d.type}</td>
                                                <td className="px-4 py-3 capitalize"><span className={`font-semibold ${docStatusColors[d.status] || 'text-gray-500'}`}>{d.status}</span></td>
                                                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(d.uploadedAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" />Upload Document</h3>
                            <DocumentUploader customerId={customer.id} />
                        </div>
                    </div>
                )}
                {tab === 'payments' && (
                    <div className="space-y-3">
                        {custPayments.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No payment records yet.</div>}
                        {custPayments.map(p => (
                            <PaymentReminderCard key={p.id} payment={p} onMarkPaid={(pid) => updatePaymentStatus(pid, 'paid')} />
                        ))}
                    </div>
                )}
                {tab === 'timeline' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <CustomerTimeline timeline={customer.timeline || []} />
                    </div>
                )}
            </motion.div>

            {showOnboarding && <OnboardingFlow customer={customer} onClose={() => setShowOnboarding(false)} />}
        </div>
    );
};

export default CustomerDetails;

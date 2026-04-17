import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePostSales } from '../../context/PostSalesContext';
import AutomationForm from '../../components/postSales/AutomationForm';
import AutomationTable from '../../components/postSales/AutomationTable';
import { ArrowLeft, User, Phone, IndianRupee, Calendar } from 'lucide-react';

const PostSalesAutomations = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { customers } = usePostSales();

    // Customer Context
    const customerId = location.state?.customerId;
    const customerContext = customerId ? customers.find(c => c.id === customerId) : null;

    // Automations State
    const [automations, setAutomations] = useState([]);

    useEffect(() => {
        // Scroll to top when coming from a specific customer (or just in general on mount)
        window.scrollTo(0, 0);

        const saved = JSON.parse(localStorage.getItem('salespal_postsales_automations') || '[]');
        // Optional: filter by customer if in customer context, else show all
        if (customerContext) {
            setAutomations(saved.filter(a => a.customerId === customerContext.id || a.customerId === 'all'));
        } else {
            setAutomations(saved);
        }
    }, [customerContext]);

    const handleSaveAutomation = (newRule) => {
        setAutomations(prev => {
            const updated = [newRule, ...prev];
            localStorage.setItem('salespal_postsales_automations', JSON.stringify(updated));
            return updated;
        });
    };

    const handleUpdateStatus = (id, newStatus) => {
        setAutomations(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, status: newStatus } : a);
            localStorage.setItem('salespal_postsales_automations', JSON.stringify(updated));
            return updated;
        });
    };

    const handleDeleteAutomation = (id) => {
        setAutomations(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem('salespal_postsales_automations', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                {customerContext && (
                    <button
                        onClick={() => navigate('/post-sales')}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">Post-Sales Automations</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Configure automated reminders and follow-ups for post-sale payments.
                </p>
            </div>

            {/* Customer Context Summary Card */}
            <AnimatePresence>
                {customerContext && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm"
                    >
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Configuring For Customer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Name</p>
                                    <p className="text-sm font-bold text-slate-800">{customerContext.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-sm font-bold text-slate-800">{customerContext.phone || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <IndianRupee className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Remaining Amount</p>
                                    <p className="text-sm font-bold text-amber-600">₹{(customerContext.totalDue - (customerContext.paid || 0)).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-rose-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Due Date</p>
                                    <p className="text-sm font-bold text-slate-800">{new Date(customerContext.renewalDate || Date.now()).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form */}
            <AutomationForm customerContext={customerContext} onSave={handleSaveAutomation} />

            {/* Table */}
            <AutomationTable
                automations={automations}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteAutomation}
            />

        </div>
    );
};

export default PostSalesAutomations;

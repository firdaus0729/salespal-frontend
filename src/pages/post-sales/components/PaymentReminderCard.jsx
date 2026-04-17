import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const statusConfig = {
    paid: {
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        border: 'border-l-emerald-400',
    },
    pending: {
        icon: <Clock className="w-4 h-4 text-amber-500" />,
        badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        border: 'border-l-amber-400',
    },
    overdue: {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        border: 'border-l-red-400',
    },
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PaymentReminderCard = ({ payment, onMarkPaid }) => {
    const config = statusConfig[payment.status] || statusConfig.pending;
    const isOverdue = payment.status === 'overdue' || (payment.status === 'pending' && new Date(payment.dueDate) < new Date());
    const effectiveConfig = isOverdue && payment.status !== 'paid' ? statusConfig.overdue : config;

    return (
        <motion.div
            whileHover={{ y: -2, shadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            className={`bg-white rounded-xl border border-gray-100 border-l-4 ${effectiveConfig.border} p-4 shadow-sm transition-all`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{payment.invoiceId}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(payment.dueDate)}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{payment.paymentMethod}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-base font-bold text-gray-800">{formatCurrency(payment.amount)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${effectiveConfig.badge}`}>
                        {isOverdue && payment.status !== 'paid' ? 'Overdue' : payment.status}
                    </span>
                </div>
            </div>
            {payment.status !== 'paid' && onMarkPaid && (
                <button
                    onClick={() => onMarkPaid(payment.id)}
                    className="mt-3 w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg transition-colors"
                >
                    Mark as Paid
                </button>
            )}
        </motion.div>
    );
};

export default PaymentReminderCard;

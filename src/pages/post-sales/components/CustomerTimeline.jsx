import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, FileText, CreditCard, User, AlertTriangle } from 'lucide-react';

const getIcon = (action) => {
    const a = action?.toLowerCase() || '';
    if (a.includes('created')) return <User className="w-3.5 h-3.5 text-violet-500" />;
    if (a.includes('onboard') || a.includes('complet')) return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (a.includes('document') || a.includes('kyc') || a.includes('agreement')) return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    if (a.includes('payment') || a.includes('invoice')) return <CreditCard className="w-3.5 h-3.5 text-amber-500" />;
    if (a.includes('cancel') || a.includes('churn') || a.includes('risk')) return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-gray-400" />;
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const CustomerTimeline = ({ timeline = [] }) => {
    if (!timeline.length) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                No timeline events yet.
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
            <ul className="space-y-4 pl-10">
                {timeline.map((event, i) => (
                    <motion.li
                        key={event.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative"
                    >
                        <div className="absolute -left-[30px] top-0.5 w-7 h-7 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center">
                            {getIcon(event.action)}
                        </div>
                        <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-sm font-medium text-gray-800">{event.action}</p>
                            {event.detail && <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>}
                            <p className="text-xs text-gray-400 mt-1">{formatDate(event.date)}</p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default CustomerTimeline;

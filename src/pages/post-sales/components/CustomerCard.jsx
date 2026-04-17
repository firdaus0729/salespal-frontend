import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, ExternalLink, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HealthScoreBadge from './HealthScoreBadge';
import OnboardingProgress from './OnboardingProgress';

const statusColors = {
    'New': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    'Onboarding': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'Active': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'At Risk': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    'Renewal Due': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    'Churned': 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const planColors = {
    'Enterprise': 'bg-indigo-50 text-indigo-700',
    'Pro': 'bg-blue-50 text-blue-700',
    'Starter': 'bg-gray-50 text-gray-600',
};

const CustomerCard = ({ customer, onboardingFlow }) => {
    const navigate = useNavigate();
    const { id, name, company, email, phone, status, plan, healthScore, onboardingStatus } = customer;
    const statusColor = statusColors[status] || 'bg-gray-100 text-gray-600';
    const planColor = planColors[plan] || 'bg-gray-100 text-gray-600';
    const completedSteps = onboardingFlow?.completedSteps || [];
    const stepIndex = onboardingFlow?.stepIndex || 0;

    return (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            onClick={() => navigate(`/post-sales/customers/${id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-100">
                        {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {company}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{status}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${planColor}`}>{plan}</span>
                </div>
            </div>

            {/* Contact */}
            <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{phone}</span>
                </div>
            </div>

            {/* Health Score */}
            <div className="mb-4">
                <HealthScoreBadge score={healthScore} showBar />
            </div>

            {/* Onboarding Progress (if relevant) */}
            {(status === 'Onboarding' || status === 'New') && (
                <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Onboarding</p>
                    <OnboardingProgress completedSteps={completedSteps} stepIndex={stepIndex} compact />
                </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                <span className="text-xs text-gray-400">Mgr: {customer.accountManager}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
            </div>
        </motion.div>
    );
};

export default CustomerCard;

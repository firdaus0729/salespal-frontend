import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, Sparkles } from 'lucide-react';
import { usePostSales } from '../../../context/PostSalesContext';

const checkItems = [
    'Account configured and ready',
    'Documents verified by team',
    'Agreement signed & stored',
    'Payment method confirmed',
];

const StepActivation = ({ customer, onComplete, isCompleted }) => {
    const { updateCustomer } = usePostSales();

    const handleActivate = () => {
        updateCustomer(customer.id, { status: 'Active', onboardingStatus: 'completed' });
        onComplete();
    };

    return (
        <div className="flex flex-col items-center text-center gap-5 py-2">
            <motion.div
                initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200"
            >
                {isCompleted ? <CheckCircle className="w-8 h-8 text-white" /> : <Rocket className="w-8 h-8 text-white" />}
            </motion.div>

            <div>
                <h3 className="text-xl font-bold text-gray-900">{isCompleted ? 'Account Activated!' : 'Final Activation'}</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                    {isCompleted
                        ? `${customer.name} is now fully onboarded and active on the ${customer.plan} plan.`
                        : 'All steps are complete. Click below to activate the account and go live.'}
                </p>
            </div>

            <ul className="space-y-2 w-full max-w-sm text-left">
                {checkItems.map((item, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {item}
                    </motion.li>
                ))}
            </ul>

            {!isCompleted && (
                <button onClick={handleActivate}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200">
                    <Sparkles className="w-4 h-4" />
                    Activate Account
                </button>
            )}
            {isCompleted && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-5 h-5" /> Onboarding Complete!
                </div>
            )}
        </div>
    );
};

export default StepActivation;

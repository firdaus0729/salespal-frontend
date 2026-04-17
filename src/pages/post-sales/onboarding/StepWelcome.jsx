import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Building, Mail } from 'lucide-react';

const StepWelcome = ({ customer, onComplete, isCompleted }) => (
    <div className="flex flex-col items-center text-center py-4 gap-6">
        <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-200"
        >
            {customer.name.slice(0, 2).toUpperCase()}
        </motion.div>
        <div>
            <h3 className="text-xl font-bold text-gray-900">Welcome, {customer.name}!</h3>
            <p className="text-gray-500 mt-1 text-sm max-w-sm mx-auto">
                We're excited to have you on board. Let's walk through the onboarding process to get you set up.
            </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
                { icon: <User className="w-4 h-4 text-indigo-500" />, label: customer.name },
                { icon: <Building className="w-4 h-4 text-violet-500" />, label: customer.company },
                { icon: <Mail className="w-4 h-4 text-blue-500" />, label: customer.plan + ' Plan' },
            ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                    className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1.5">
                    {item.icon}
                    <span className="text-xs text-gray-600 font-medium truncate w-full text-center">{item.label}</span>
                </motion.div>
            ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-guided onboarding — estimated 5 minutes</span>
        </div>
        {!isCompleted && (
            <button onClick={onComplete}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                Let's Begin →
            </button>
        )}
    </div>
);

export default StepWelcome;

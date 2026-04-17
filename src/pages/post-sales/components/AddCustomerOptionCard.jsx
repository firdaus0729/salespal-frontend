import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AddCustomerOptionCard = ({ icon, title, description, isActive, onClick }) => {
    return (
        <motion.button
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full h-full text-left bg-white rounded-xl border p-6 flex items-center gap-5 transition-all group ${isActive
                ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
                : 'border-gray-200 hover:border-indigo-300 shadow-sm'
                }`}
        >
            {/* Icon Box */}
            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                }`}>
                {icon}
            </div>

            {/* Text Content */}
            <div className="flex-1">
                <h3 className={`font-semibold text-[15px] mb-1 transition-colors ${isActive ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                    {title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed pr-2">
                    {description}
                </p>
            </div>

            {/* Right Arrow */}
            <div className="shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ArrowRight className="w-5 h-5" />
            </div>
        </motion.button>
    );
};

export default AddCustomerOptionCard;

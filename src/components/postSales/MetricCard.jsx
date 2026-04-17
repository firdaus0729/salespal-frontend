import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const MetricCard = ({ icon, label, value, sub, color, textcolor }) => (
    <motion.div whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        className="bg-white rounded-[1rem] border border-gray-100 shadow-sm p-5 flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${color} shrink-0`}>
                {icon}
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
        </div>
        <div>
            <h3 className="text-[1.35rem] font-bold text-gray-900 leading-tight tracking-tight">{value}</h3>
            <p className="text-[13px] text-gray-500 mt-1">{label}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
        </div>
    </motion.div>
);

export default MetricCard;

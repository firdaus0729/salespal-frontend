import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const AIInsightBanner = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50 p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h3 className="text-indigo-900 font-semibold text-sm">AI is optimizing follow-up timing...</h3>
                <p className="text-indigo-600/70 text-xs mt-0.5">Best response rates: <span className="font-semibold text-indigo-700">10 AM – 12 PM</span>, <span className="font-semibold text-indigo-700">4 PM – 6 PM</span></p>
            </div>
        </div>
    </motion.div>
);

export default AIInsightBanner;

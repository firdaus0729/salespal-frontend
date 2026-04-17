import React from 'react';
import { motion } from 'framer-motion';

const UsageProgress = ({ label, used, limit, color = 'blue' }) => {
    const percentage = Math.min(100, Math.round((used / limit) * 100));

    const getProgressColor = () => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-amber-500';

        const colorMap = {
            blue: 'bg-indigo-600',
            green: 'bg-emerald-600',
            purple: 'bg-purple-600',
            orange: 'bg-orange-600',
            indigo: 'bg-indigo-600',
            gray: 'bg-gray-600'
        };
        return colorMap[color] || 'bg-indigo-600';
    };

    const getBackgroundColor = () => {
        if (percentage >= 90) return 'bg-red-100';
        if (percentage >= 70) return 'bg-amber-100';
        return 'bg-gray-100';
    };

    const getTextColor = () => {
        if (percentage >= 90) return 'text-red-700';
        if (percentage >= 70) return 'text-amber-700';
        return 'text-gray-700';
    };

    const formatLabel = (key) => {
        const labels = {
            images: 'Images',
            videos: 'Videos',
            posts: 'Posts',
            calls: 'Calls',
            whatsapp: 'WhatsApp',
            campaigns: 'Campaigns',
            leads: 'Leads',
            ai: 'AI Usage'
        };
        return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    };

    const barColor = getProgressColor();
    const bgColor = getBackgroundColor();
    const textColor = getTextColor();

    return (
        <div className="group">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide group-hover:text-gray-800 transition-colors">
                    {formatLabel(label)}
                </span>
                <span className={`text-xs font-semibold ${textColor} px-2 py-0.5 rounded-md ${bgColor}`}>
                    {used} <span className="text-gray-400 font-normal">/ {limit}</span>
                </span>
            </div>
            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: 1,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.1
                    }}
                    className={`absolute top-0 left-0 h-full rounded-full ${barColor} transition-colors duration-300`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
                </motion.div>
            </div>
            {percentage >= 90 && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1.5 font-medium"
                >
                    Almost at limit - consider upgrading
                </motion.p>
            )}
        </div>
    );
};

export default UsageProgress;

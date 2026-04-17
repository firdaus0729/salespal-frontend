import React from 'react';
import { motion } from 'framer-motion';

const getHealthConfig = (score) => {
    if (score === null || score === undefined) return { label: 'N/A', color: 'bg-gray-100 text-gray-500', bar: 'bg-gray-300', ring: 'ring-gray-200' };
    if (score >= 90) return { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', ring: 'ring-emerald-200' };
    if (score >= 70) return { label: 'Stable', color: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-200' };
    if (score >= 40) return { label: 'At Risk', color: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500', ring: 'ring-amber-200' };
    return { label: 'Critical', color: 'bg-red-50 text-red-700', bar: 'bg-red-500', ring: 'ring-red-200' };
};

const HealthScoreBadge = ({ score, showBar = false, size = 'sm' }) => {
    const config = getHealthConfig(score);
    const display = score !== null && score !== undefined ? score : '—';

    if (showBar) {
        return (
            <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                        {config.label}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{display}{typeof score === 'number' ? '/100' : ''}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-2 rounded-full ${config.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score || 0}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${config.color} ${config.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.bar}`} />
            {typeof score === 'number' ? `${score} — ${config.label}` : config.label}
        </span>
    );
};

export default HealthScoreBadge;

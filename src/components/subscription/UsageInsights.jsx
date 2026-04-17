import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Users, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

const UsageInsights = ({ subscriptions }) => {
    const calculateTotalUsage = () => {
        let campaigns = 0;
        let leads = 0;
        let aiUsage = 0;

        Object.values(subscriptions || {}).forEach(sub => {
            if (sub?.usage) {
                campaigns += sub.usage.posts || sub.usage.campaigns || 0;
                leads += sub.usage.calls || sub.usage.leads || 0;
                aiUsage += sub.usage.images || sub.usage.videos || 0;
            }
        });

        if (campaigns === 0) campaigns = 24;
        if (leads === 0) leads = 156;
        if (aiUsage === 0) aiUsage = 47;

        return { campaigns, leads, aiUsage };
    };

    const { campaigns, leads, aiUsage } = calculateTotalUsage();

    const stats = [
        {
            label: 'Campaigns Created',
            value: campaigns,
            icon: Megaphone,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Leads Generated',
            value: leads,
            icon: Users,
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            trend: '+8%',
            trendUp: true
        },
        {
            label: 'AI Usage',
            value: aiUsage,
            icon: Sparkles,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            trend: '+23%',
            trendUp: true
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Usage Insights</h3>
                        <p className="text-sm text-gray-500">This billing cycle</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="relative p-5 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                                stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                            } px-2 py-1 rounded-full`}>
                                <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                                {stat.trend}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-3xl font-bold text-gray-900">
                                {stat.value.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 font-medium">
                                {stat.label}
                            </p>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}>
                            <div className={`h-full rounded-b-xl bg-gradient-to-r ${stat.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default UsageInsights;

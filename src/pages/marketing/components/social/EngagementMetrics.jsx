import React from 'react';
import { Heart, Eye, MessageCircle, TrendingUp } from 'lucide-react';

const MetricItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
        <div className={`p-2 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <span className="text-xs text-gray-500 block">{label}</span>
            <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
    </div>
);

const EngagementMetrics = () => {
    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-gray-900">Projected Impact</h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <MetricItem icon={Eye} label="Est. Reach" value="2.4k" color="bg-blue-600" />
                <MetricItem icon={Heart} label="Est. Likes" value="150+" color="bg-pink-600" />
                <MetricItem icon={MessageCircle} label="Est. Comments" value="12" color="bg-purple-600" />
            </div>

            <p className="text-xs text-gray-500 italic">
                *Predictions based on similar posts in your industry.
            </p>
        </div>
    );
};

export default EngagementMetrics;

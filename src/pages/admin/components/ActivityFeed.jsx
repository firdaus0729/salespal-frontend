import React from 'react';
import { UserPlus, Megaphone, CreditCard, AlertCircle, FolderPlus, ArrowUpCircle } from 'lucide-react';

const typeMap = {
    user:     { icon: UserPlus,      bg: 'bg-blue-50',    color: 'text-blue-600'    },
    campaign: { icon: Megaphone,     bg: 'bg-purple-50',  color: 'text-purple-600'  },
    payment:  { icon: CreditCard,    bg: 'bg-emerald-50', color: 'text-emerald-600' },
    alert:    { icon: AlertCircle,   bg: 'bg-amber-50',   color: 'text-amber-600'   },
    project:  { icon: FolderPlus,    bg: 'bg-orange-50',  color: 'text-orange-600'  },
    upgrade:  { icon: ArrowUpCircle, bg: 'bg-cyan-50',    color: 'text-cyan-600'    },
};

const ActivityFeed = ({ activities = [] }) => {
    return (
        <div className="space-y-4">
            {activities.map((activity, index) => {
                const config = typeMap[activity.type] || typeMap.alert;
                const Icon = config.icon;
                return (
                    <div key={index} className="flex items-start gap-3">
                        <div
                            className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}
                        >
                            <Icon size={15} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{activity.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityFeed;

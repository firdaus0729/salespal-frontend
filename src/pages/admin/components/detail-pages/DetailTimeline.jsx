import React from 'react';
import { 
  Phone, Mail, MessageCircle, Mic, Zap, Clock, 
  AlertCircle, CheckCircle, FileText,
  UserPlus, Megaphone, CreditCard
} from 'lucide-react';

/**
 * DetailTimeline - Activity/Communication timeline
 * Usage: <DetailTimeline title="Activity Log" items={[{time, icon, type, label, detail}]} />
 */

const iconMap = {
  call: { Icon: Phone, bg: 'bg-blue-50', color: 'text-blue-600' },
  email: { Icon: Mail, bg: 'bg-purple-50', color: 'text-purple-600' },
  whatsapp: { Icon: MessageCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  transcript: { Icon: Mic, bg: 'bg-orange-50', color: 'text-orange-600' },
  ai: { Icon: Zap, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  note: { Icon: FileText, bg: 'bg-gray-50', color: 'text-gray-600' },
  activity: { Icon: Clock, bg: 'bg-cyan-50', color: 'text-cyan-600' },
  alert: { Icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
  success: { Icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
  user: { Icon: UserPlus, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  campaign: { Icon: Megaphone, bg: 'bg-purple-50', color: 'text-purple-600' },
  payment: { Icon: CreditCard, bg: 'bg-emerald-50', color: 'text-emerald-600' },
};

const DetailTimeline = ({ title, icon: HeaderIcon, items = [] }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        {HeaderIcon && <HeaderIcon size={24} className="text-blue-600" />}
        {title}
      </h2>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No activities yet</p>
        ) : (
          items.map((item, idx) => {
            const iconConfig = iconMap[item.type] || iconMap.activity;
            const { Icon, bg, color } = iconConfig;

            return (
              <div key={idx} className="flex gap-4">
                {/* Timeline Icon */}
                <div className={`${bg} rounded-lg p-2.5 shrink-0`}>
                  <Icon size={18} className={color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {item.title && (
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.title}
                    </p>
                  )}
                  {item.detail && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.detail}
                    </p>
                  )}
                  {item.time && (
                    <p className="text-xs text-gray-400 mt-2">
                      {item.time}
                    </p>
                  )}
                </div>

                {/* Optional badge/status */}
                {item.badge && (
                  <div className="shrink-0">
                    {item.badge}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DetailTimeline;

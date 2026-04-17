import React from 'react';

/**
 * DetailMetricCard - Display single or multiple metrics in summary format
 * Usage: <DetailMetricCard label="Total Leads" value="1,250" badge={...} />
 */
const DetailMetricCard = ({ 
  label, 
  value, 
  icon: Icon, 
  badge,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    cyan: 'text-cyan-600 bg-cyan-50',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {badge}
        </div>
      )}
    </div>
  );
};

export default DetailMetricCard;

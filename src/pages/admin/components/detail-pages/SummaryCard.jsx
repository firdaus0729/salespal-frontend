import React from 'react';

/**
 * SummaryCard - Right-side summary panel component
 * Usage: <SummaryCard title="Status" items={[{label, value, color}]} />
 */
const SummaryCard = ({ 
  title, 
  items = [],
  icon: Icon,
  action
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-blue-600" />}
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {item.label}
            </p>
            {item.badge ? (
              <div className="mb-2">
                {item.badge}
              </div>
            ) : (
              <p className={`text-2xl font-bold ${item.color || 'text-gray-900'}`}>
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {action && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          {action}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

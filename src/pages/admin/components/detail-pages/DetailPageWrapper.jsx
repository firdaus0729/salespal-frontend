import React from 'react';

/**
 * DetailPageWrapper - Standard layout for all admin detail pages
 * Structure: Header -> Back Button -> 2-column layout (Left: Main content | Right: Summary)
 */
const DetailPageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-x-hidden">
      {children}
    </div>
  );
};

export const DetailPageContent = ({ left, right, gap = "16px" }) => {
  return (
    <div className="w-full px-6 py-6 flex-1">
      <div 
        className="grid"
        style={{ gridTemplateColumns: '2fr 1fr', gap: gap }}
      >
        {/* LEFT SIDE - Main Content */}
        <div className="space-y-6 min-w-0">
          {left}
        </div>

        {/* RIGHT SIDE - Summary Panel */}
        <div className="space-y-6 min-w-0">
          {right}
        </div>
      </div>
    </div>
  );
};

export const DetailPageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  badge, 
  action,
  gradient = 'from-blue-600 to-indigo-600' 
}) => {
  return (
    <div className={`w-full bg-gradient-to-r ${gradient} text-white shadow-sm border-b border-white/10`}>
      <div className="px-6 py-5 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {Icon && (
              <div className="p-2 bg-white/15 rounded-lg">
                <Icon size={20} />
              </div>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-white/80 text-sm ml-11">{subtitle}</p>
          )}
          {badge && (
            <div className="mt-2 ml-11 flex gap-2">
              {badge}
            </div>
          )}
        </div>
        {action && (
          <div className="flex gap-2 ml-4 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export const DetailPageBackButton = ({ onClick, label = "Back" }) => {
  return (
    <div className="w-full px-6 py-4">
      <button 
        onClick={onClick}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <span className="text-lg">←</span>
        {label}
      </button>
    </div>
  );
};

export default DetailPageWrapper;

import React from 'react';

/**
 * DetailTable - Standardized table for detail pages (billing history, campaigns, etc)
 * Usage: <DetailTable title="Billing History" columns={[{key, label}]} data={rows} />
 */
const DetailTable = ({ 
  title, 
  columns = [], 
  data = [],
  icon: Icon,
  onRowClick = null
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-blue-600" />}
          {title}
        </h2>
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500 text-sm">
          No data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {columns.map((col) => (
                  <th 
                    key={col.key}
                    className="px-6 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-gray-100 bg-white/50 hover:bg-gray-50/70 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key}
                      className="px-6 py-4 text-gray-900"
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetailTable;

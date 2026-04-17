import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  label: string;
  variant?: 'primary' | 'danger' | 'default';
  onClick: (row: any) => void;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ 
  columns, 
  data, 
  actions, 
  emptyMessage = 'No data available', 
  onRowClick 
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/60">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                        {actions && (
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (actions ? 1 : 0)}
                                className="text-center py-12 text-gray-400 text-sm"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row: any, rowIndex: number) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {actions.map((action, aIdx) => (
                                                <button
                                                    key={aIdx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row);
                                                    }}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                                        action.variant === 'danger'
                                                            ? 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
                                                            : action.variant === 'primary'
                                                            ? 'text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                                                            : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                                    }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;


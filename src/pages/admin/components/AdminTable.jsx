import React from 'react';
import { Ban } from 'lucide-react';

/**
 * Reusable admin table component.
 *
 * columns: Array<{ key: string, label: string, render?: (value, row) => ReactNode }>
 * data: Array<object>
 * actions: Array<{ 
 *   label: string | ((row) => string), 
 *   variant?: 'primary' | 'danger' | 'default' | ((row) => string), 
 *   disabled?: boolean | ((row) => boolean),
 *   onClick: (row) => void 
 * }>
 * onRowClick?: (row) => void
 */
const AdminTable = ({ columns, data, actions, emptyMessage = 'No data available', onRowClick }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/60">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                        {actions && (
                            <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
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
                        data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-3 py-2.5 text-gray-700 whitespace-nowrap text-[13px]">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 transition-opacity">
                                            {actions.map((action, aIdx) => {
                                                const label = typeof action.label === 'function' ? action.label(row) : action.label;
                                                const variant = typeof action.variant === 'function' ? action.variant(row) : action.variant;
                                                const disabled = typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;
                                                
                                                if (!label) return null;

                                                return (
                                                    <button
                                                        key={aIdx}
                                                        disabled={disabled}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!disabled) action.onClick(row);
                                                        }}
                                                        className={`relative group/btn text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                                                            disabled
                                                                ? 'opacity-40 cursor-not-allowed text-gray-400 bg-gray-50 border border-gray-200'
                                                                : variant === 'danger'
                                                                    ? 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
                                                                    : variant === 'primary'
                                                                        ? 'text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                                                                        : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {disabled && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity bg-white/10 rounded-md pointer-events-none">
                                                                <Ban size={12} className="text-red-500 stroke-[3]" />
                                                            </div>
                                                        )}
                                                        <span className={disabled ? 'group-hover/btn:invisible' : ''}>
                                                            {label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
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

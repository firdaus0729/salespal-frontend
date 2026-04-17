import React from 'react';
import AutomationRow from './AutomationRow';

const AutomationTable = ({ automations, onUpdateStatus, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Existing Automations</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{automations.length} total active rules</p>
                </div>
            </div>

            <div className="overflow-visible">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Channel</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Trigger</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">Created</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {automations.map((auto, index) => (
                            <AutomationRow
                                key={auto.id}
                                automation={auto}
                                index={index}
                                onUpdateStatus={onUpdateStatus}
                                onDelete={onDelete}
                            />
                        ))}
                        {automations.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No automations configured yet. Create one above to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AutomationTable;

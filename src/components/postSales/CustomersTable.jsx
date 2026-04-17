import React from 'react';
import { Users } from 'lucide-react';
import CustomerRow from './CustomerRow';
import { usePostSales } from '../../context/PostSalesContext';

const CustomersTable = () => {
    const { customers } = usePostSales();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Customers to Follow Up</h3>
                </div>

            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total Due</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Remaining</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Last Contact</th>
                            <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {customers.map((c) => (
                            <CustomerRow key={c.id} customer={c} />
                        ))}
                        {customers.length === 0 && (
                            <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No customers in post-sales follow-up.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersTable;

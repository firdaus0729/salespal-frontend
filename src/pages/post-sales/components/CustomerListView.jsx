import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';

const CustomerListView = ({ customers, onSelectCustomer, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter customers by name or phone
    const filteredCustomers = customers.filter(customer => {
        const search = searchTerm.toLowerCase();
        return (
            customer.name?.toLowerCase().includes(search) ||
            customer.phone?.toLowerCase().includes(search) ||
            customer.email?.toLowerCase().includes(search)
        );
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full space-y-4"
        >
            {/* Back Button & Header */}
            <button
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Back to upload
            </button>

            {/* Title & Subtitle */}
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">
                    Select a Customer
                </h2>
                <p className="text-gray-500">
                    We found {customers.length} customer{customers.length !== 1 ? 's' : ''} from your file
                </p>
            </div>

            {/* Search Bar */}
            {customers.length > 3 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                </div>
            )}

            {/* Customer List */}
            {filteredCustomers.length > 0 ? (
                <div className="space-y-2">
                    {filteredCustomers.map((customer, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onSelectCustomer(customer)}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-center justify-between gap-4">
                                {/* Customer Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Name */}
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {customer.name || 'Unknown'}
                                    </h3>
                                    {/* Phone & Email */}
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                        {customer.phone && (
                                            <>
                                                <span>{customer.phone}</span>
                                                {customer.email && <span>•</span>}
                                            </>
                                        )}
                                        {customer.email && <span className="truncate">{customer.email}</span>}
                                    </div>
                                    {/* Total Amount & Due Date */}
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className="text-gray-700 font-medium">
                                            {formatCurrency(customer.totalAmount || customer.totalDue || 0)}
                                        </span>
                                        <span className="text-gray-500">
                                            Due: {formatDate(customer.dueDate)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Arrow Icon */}
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No customers found matching "{searchTerm}"</p>
                </div>
            )}

            {/* Info Text */}
            {filteredCustomers.length > 0 && (
                <p className="text-xs text-gray-400 text-center mt-4">
                    Click on a customer to review and confirm details
                </p>
            )}
        </motion.div>
    );
};

export default CustomerListView;

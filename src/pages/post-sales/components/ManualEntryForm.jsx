import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import {
    DEFAULT_PREFERRED_LOCALE,
    getAllTimeZones,
    getDefaultTimeZone,
    getLanguageSelectOptions,
    resolveTimeZoneOption
} from '../../../utils/localeOptions';

const ManualEntryForm = ({ onSuccess, onCancel }) => {
    const timezoneOptions = getAllTimeZones();
    const languageOptions = getLanguageSelectOptions();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        totalDue: '',
        amountPaid: '',
        dueDate: '',
        currency: 'INR',
        timezone: resolveTimeZoneOption(getDefaultTimeZone(), timezoneOptions),
        preferredLocale: DEFAULT_PREFERRED_LOCALE,
        autoLanguageSwitch: true,
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Customer name is required';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        if (!formData.totalDue || parseInt(formData.totalDue) <= 0) {
            newErrors.totalDue = 'Total amount must be greater than 0';
        }
        if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
            newErrors.dueDate = 'Due date cannot be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // Format data for ExtractedDetailsView
        const extractedData = {
            name: formData.name.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            email: formData.email.trim(),
            company: formData.company.trim(),
            totalDue: parseInt(formData.totalDue) || 0,
            amountPaid: parseInt(formData.amountPaid) || 0,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
            currency: formData.currency,
            status: 'active',
            notes: 'Manually entered',
            timezone: formData.timezone,
            preferredLocale: formData.preferredLocale,
            autoLanguageSwitch: formData.autoLanguageSwitch,
        };

        if (onSuccess) {
            onSuccess(extractedData, 'single');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
        >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enter Customer Details</h2>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Row 1: Name & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Customer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder=""
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-blue-50'
                                }`}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Phone / WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder=""
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Email & Company */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Email (optional)
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder=""
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Company (optional)
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Company name"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>
                    </div>

                    {/* Row 3: Total Amount, Paid, Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Total Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="totalDue"
                                value={formData.totalDue}
                                onChange={handleInputChange}
                                placeholder=""
                                min="1"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                                    errors.totalDue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.totalDue && (
                                <p className="text-xs text-red-600 mt-1">{errors.totalDue}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Already Paid (optional)
                            </label>
                            <input
                                type="number"
                                name="amountPaid"
                                value={formData.amountPaid}
                                onChange={handleInputChange}
                                placeholder=""
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all ${
                                    errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.dueDate && (
                                <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">
                            Currency
                        </label>
                        <div className="flex gap-3">
                            {['INR', 'USD'].map(curr => (
                                <button
                                    key={curr}
                                    onClick={() => setFormData(prev => ({ ...prev, currency: curr }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        formData.currency === curr
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Timezone</label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            >
                                {timezoneOptions.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Language</label>
                            <select
                                name="preferredLocale"
                                value={formData.preferredLocale}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            >
                                {languageOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mt-8">
                            <input
                                type="checkbox"
                                checked={formData.autoLanguageSwitch}
                                onChange={(e) => setFormData((prev) => ({ ...prev, autoLanguageSwitch: e.target.checked }))}
                            />
                            Auto Language Switch
                        </label>
                    </div>

                    {/* Info Message */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                            All information will be reviewed before creating the customer record.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                    >
                        Process with AI <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ManualEntryForm;

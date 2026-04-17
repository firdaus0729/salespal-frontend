import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BarChart2, Megaphone, Folder, Calendar } from 'lucide-react';
import Button from '../ui/Button';

const COMPARE_TYPES = [
    { id: 'time', label: 'Time', icon: Clock, enabled: true },
    { id: 'channel', label: 'Channel', icon: BarChart2, enabled: false },
    { id: 'campaign', label: 'Campaign', icon: Megaphone, enabled: false },
    { id: 'project', label: 'Project', icon: Folder, enabled: false },
];

const TIME_OPTIONS = [
    { id: 'previous_period', label: 'Previous Period', enabled: true },
    { id: 'same_month_last_year', label: 'Same Period Last Year', enabled: false },
    { id: 'custom', label: 'Custom Range', icon: Calendar, enabled: false },
];

const ComparePanel = ({ isOpen, onClose, config, onApply, onReset }) => {
    const [localConfig, setLocalConfig] = useState(config);

    // Sync local state when opened
    useEffect(() => {
        if (isOpen) {
            setLocalConfig(config);
        }
    }, [isOpen, config]);

    const handleApply = () => {
        onApply(localConfig);
        onClose();
    };

    const handleReset = () => {
        onReset();
        setLocalConfig({
            type: 'time',
            comparisonType: 'previous_period',
            customRange: null
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Compare Performance</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                            
                            {/* Section 1: Compare Type */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                                    Compare Type
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {COMPARE_TYPES.map(({ id, label, icon: Icon, enabled }) => (
                                        <button
                                            key={id}
                                            disabled={!enabled}
                                            onClick={() => setLocalConfig({ ...localConfig, type: id })}
                                            className={`
                                                flex flex-col items-start p-4 rounded-xl border text-left transition-all
                                                ${!enabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : 
                                                    localConfig.type === id 
                                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 mb-2 ${localConfig.type === id ? 'text-blue-600' : 'text-gray-500'}`} />
                                            <span className={`text-sm font-medium ${localConfig.type === id ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {label}
                                            </span>
                                            {!enabled && <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase">Coming soon</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Comparison Options */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                                    Comparison Period
                                </h3>
                                <div className="space-y-2">
                                    {TIME_OPTIONS.map(({ id, label, icon: Icon, enabled }) => (
                                        <label
                                            key={id}
                                            className={`
                                                flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                                                ${!enabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : 
                                                    localConfig.comparisonType === id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="radio" 
                                                    name="comparison_type"
                                                    value={id}
                                                    checked={localConfig.comparisonType === id}
                                                    disabled={!enabled}
                                                    onChange={() => setLocalConfig({ ...localConfig, comparisonType: id })}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className={`text-sm font-medium ${localConfig.comparisonType === id ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {label}
                                                </span>
                                            </div>
                                            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                                            {!enabled && !Icon && <span className="text-xs text-gray-400 font-medium">Coming soon</span>}
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-6 bg-gray-50 flex items-center justify-between gap-4">
                            <button 
                                onClick={handleReset}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Clear Comparison
                            </button>
                            <Button 
                                onClick={handleApply}
                                className="px-6"
                            >
                                Apply Compare
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ComparePanel;

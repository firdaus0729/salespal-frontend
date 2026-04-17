import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, Bot, MoreVertical, Pause, Play, Trash2 } from 'lucide-react';
import { usePostSales } from '../../context/PostSalesContext';

const ChannelIcon = ({ channel }) => {
    switch (channel) {
        case 'WhatsApp': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
        case 'SMS': return <Phone className="w-4 h-4 text-blue-500" />;
        case 'Email': return <Mail className="w-4 h-4 text-rose-500" />;
        case 'AI Call': return <Bot className="w-4 h-4 text-indigo-500" />;
        default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
};

const AutomationRow = ({ automation, index, onUpdateStatus, onDelete }) => {
    const { getCustomer } = usePostSales();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const isAll = automation.customerId === 'all';
    const customer = !isAll ? getCustomer(automation.customerId) : null;
    const name = isAll ? 'All Customers' : (customer?.name || `Customer ${automation.customerId.slice(0, 4)}`);
    const initial = isAll ? 'ALL' : name.slice(0, 2).toUpperCase();

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="hover:bg-indigo-50/40 transition-colors group"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                        {initial}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">
                            {name}
                        </p>
                        <p className="text-xs text-gray-400">Target Segment</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <ChannelIcon channel={automation.channel} />
                    <span className="text-sm font-medium text-gray-700">{automation.channel}</span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm text-gray-600 font-medium">{automation.trigger}</span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{automation.action}</span>
            </td>
            <td className="px-4 py-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${automation.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
                    {automation.status}
                </span>
            </td>
            <td className="px-4 py-4 text-xs text-gray-500 hidden xl:table-cell">
                {new Date(automation.createdAt).toLocaleDateString('en-GB')}
            </td>
            <td className="px-4 py-4 text-right relative" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-indigo-50 ${showMenu ? 'bg-indigo-50 text-indigo-600' : ''}`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
                {/* Dropdown Menu */}
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-10"
                    >
                        <button
                            onClick={() => {
                                onUpdateStatus(automation.id, automation.status === 'Active' ? 'Paused' : 'Active');
                                setShowMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {automation.status === 'Active' ? (
                                <><Pause className="w-4 h-4 text-amber-500" /> Pause Automation</>
                            ) : (
                                <><Play className="w-4 h-4 text-emerald-500" /> Resume Automation</>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                onDelete(automation.id);
                                setShowMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Rule
                        </button>
                    </motion.div>
                )}
            </td>
        </motion.tr>
    );
};

export default AutomationRow;

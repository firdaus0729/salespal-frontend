import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SidebarUserMenu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(user?.full_name || user?.name || 'U');
    const userName = user?.full_name || user?.name || 'My Account';
    const userEmail = user?.email || '';

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isDropdownOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const menuItems = [
        {
            label: 'My Profile',
            icon: User,
            onClick: () => {
                navigate(isAdmin ? '/admin/profile' : '/profile');
                setIsDropdownOpen(false);
            },
            className: 'hover:bg-gray-50'
        },
        {
            label: 'Account Settings',
            icon: Settings,
            onClick: () => {
                navigate(isAdmin ? '/admin/settings' : '/settings');
                setIsDropdownOpen(false);
            },
            className: 'hover:bg-gray-50'
        },
        {
            label: 'Logout',
            icon: LogOut,
            onClick: handleLogout,
            className: 'hover:bg-red-50 hover:text-red-600'
        }
    ];

    return (
        <div className="p-3 border-t border-gray-100 shrink-0 relative">
            {/* User Block Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
            >
                {/* Avatar */}
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm border border-gray-200"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
                        {initials}
                    </div>
                )}

                {/* User Info */}
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                    </p>
                </div>

                {/* Chevron Icon */}
                <ChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                        <div className="py-1.5">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={item.onClick}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors ${item.className}`}
                                    >
                                        <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SidebarUserMenu;

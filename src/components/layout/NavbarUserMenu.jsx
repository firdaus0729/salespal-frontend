import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NavbarUserMenu = () => {
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

    return (
        <div className="relative">
            {/* User Trigger Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                {/* Avatar */}
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-white border border-gray-200"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm ring-2 ring-white">
                        {initials}
                    </div>
                )}

                {/* User Info - Hidden on mobile, visible on medium screens and up */}
                <div className="hidden md:flex flex-col items-start text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                        {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
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
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={16} strokeWidth={2} className="shrink-0" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NavbarUserMenu;

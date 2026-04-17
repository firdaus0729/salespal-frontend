import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Link as LinkIcon, Bell, TrendingUp } from 'lucide-react';

const MarketingSettingsLayout = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Add a small threshold to avoid jitter
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navItems = [
        { path: 'integrations', label: 'Integrations', icon: LinkIcon },
        { path: 'notifications', label: 'Notifications', icon: Bell },
        { path: 'sales', label: 'Sales', icon: TrendingUp },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your workspace, integrations, and preferences.</p>
            </div>

            <div
                className={`border-b border-gray-200 mb-8 -mx-6 px-6 md:-mx-8 md:px-8 py-3 transition-all duration-300 ease-in-out ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-[10px] pointer-events-none'
                    }`}
            >
                <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                                ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="min-h-[400px]">
                <Outlet />
            </div>
        </div>
    );
};

export default MarketingSettingsLayout;

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Megaphone,
    Phone,
    UserCheck,
    Headphones,
    CreditCard,
    Settings,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    FolderKanban,
    Share2,
    Users,
    Activity,
    Ticket,
    BarChart3,
    Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarUserMenu from './SidebarUserMenu';
import { useAuth } from '../../context/AuthContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import GlobalMaintenancePage from '../maintenance/GlobalMaintenancePage';
import MaintenanceBanner from '../maintenance/MaintenanceBanner';

// Module path → maintenance key mapping
const MODULE_MAINTENANCE_KEYS = {
    '/marketing': 'marketing',
    '/sales': 'sales',
    '/post-sales': 'post-sales',
    '/support': 'support',
};

const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { isGlobalMaintenance, isModuleUnderMaintenance, loading: maintenanceLoading } = useMaintenance();

    const isAdmin = user?.role === 'admin';

    // State for expanded menus
    const [expandedMenus, setExpandedMenus] = useState({});

    // Initialize expanded state based on current URL
    useEffect(() => {
        if (location.pathname.startsWith('/marketing')) {
            setExpandedMenus(prev => ({ ...prev, '/marketing': true }));
        }
        if (location.pathname.startsWith('/sales')) {
            setExpandedMenus(prev => ({ ...prev, '/sales': true }));
        }
        if (location.pathname.startsWith('/post-sales')) {
            setExpandedMenus(prev => ({ ...prev, '/post-sales': true }));
        }
        if (location.pathname.startsWith('/support')) {
            setExpandedMenus(prev => ({ ...prev, '/support': true }));
        }
    }, [location.pathname]);

    const toggleMenu = (path) => {
        setExpandedMenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    // ─── Global maintenance guard for non-admin users ────────────────────
    if (!maintenanceLoading && isGlobalMaintenance && !isAdmin) {
        return <GlobalMaintenancePage />;
    }

    const navItems = [
        {
            label: 'Marketing',
            path: '/marketing',
            icon: Megaphone,
            moduleKey: 'marketing',
            children: [
                { label: 'Dashboard', path: '/marketing', icon: LayoutDashboard, end: true },
                { label: 'Projects', path: '/marketing/projects', icon: FolderKanban },
                { label: 'Social', path: '/marketing/social', icon: Share2 }
            ]
        },
        {
            label: 'Sales',
            path: '/sales',
            icon: Phone,
            moduleKey: 'sales',
            children: [
                { label: 'Dashboard', path: '/sales', icon: LayoutDashboard, end: true },
                { label: 'Leads', path: '/sales/leads', icon: Users },
                { label: 'Interactions', path: '/sales/interactions', icon: Activity },
                { label: 'Campaigns', path: '/sales/campaigns', icon: Megaphone },
            ]
        },
        {
            label: 'Post Sales',
            path: '/post-sales',
            icon: UserCheck,
            moduleKey: 'post-sales',
            children: [
                { label: 'Dashboard', path: '/post-sales', icon: LayoutDashboard, end: true },
                { label: 'Customers', path: '/post-sales/customers', icon: Users },
                { label: 'Automations', path: '/post-sales/automations', icon: Settings }
            ]
        },
        {
            label: 'Support',
            path: '/support',
            icon: Headphones,
            moduleKey: 'support',
            children: [
                { label: 'Dashboard', path: '/support', icon: LayoutDashboard, end: true },
                { label: 'Tickets', path: '/support/tickets', icon: Ticket },
                { label: 'Analytics', path: '/support/analytics', icon: BarChart3 }
            ]
        },
        { label: 'Subscription', path: '/subscription', icon: CreditCard },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];



    const isChildActive = (item) => {
        if (!item.children) return false;
        return item.children.some(child => {
            if (child.end) return location.pathname === child.path;
            return location.pathname.startsWith(child.path);
        });
    };

    const isParentActive = (item) => {
        if (item.children) {
            return location.pathname.startsWith(item.path);
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
                <div className="flex items-center justify-center py-3 border-b border-gray-100 shrink-0 h-16">
                    <Link to="/">
                        <img src="/BlackTextLogo.webp" alt="SalesPal" className="h-10 w-auto object-contain" />
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto pt-5 px-3 space-y-1">
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus[item.path];
                        const isActiveParent = isParentActive(item);

                        // Check if this module is under maintenance
                        const moduleUnderMaintenance = item.moduleKey && isModuleUnderMaintenance(item.moduleKey);
                        const isModuleDisabled = moduleUnderMaintenance;

                        return (
                            <div key={item.path}>
                                {hasChildren ? (
                                    <div className="relative group">
                                        <button
                                            onClick={() => {
                                                if (isModuleDisabled) return; // Block click
                                                toggleMenu(item.path);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isModuleDisabled
                                                    ? 'text-gray-400 cursor-not-allowed opacity-60'
                                                    : isActiveParent
                                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
                                                {item.label}
                                                {/* Maintenance badge */}
                                                {moduleUnderMaintenance && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 leading-tight">
                                                        <Wrench size={10} />
                                                        Maintenance
                                                    </span>
                                                )}
                                            </div>
                                            {!isModuleDisabled && (
                                                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                            )}
                                        </button>
                                        {/* Tooltip for disabled modules */}
                                        {isModuleDisabled && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                                                Currently under maintenance
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
                                        {item.label}
                                    </NavLink>
                                )}

                                {/* Dropdown Children */}
                                <AnimatePresence>
                                    {hasChildren && isExpanded && !isModuleDisabled && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-100 space-y-1">
                                                {item.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        end={child.end}
                                                        className={({ isActive }) =>
                                                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                                ? 'text-blue-600 bg-blue-50 font-medium'
                                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                            }`
                                                        }
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                <SidebarUserMenu />
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[240px] overflow-auto bg-gray-50 flex flex-col">
                {/* Admin maintenance banner */}
                {isAdmin && <MaintenanceBanner />}
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;

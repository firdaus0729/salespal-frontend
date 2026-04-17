import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FolderKanban,
    Megaphone,
    BarChart3,
    Settings,
    User,
} from 'lucide-react';
import SidebarUserMenu from '../components/layout/SidebarUserMenu';

const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Profile', path: '/admin/profile', icon: User },
];

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 shadow-sm">
                {/* Logo */}
                <div className="flex items-center justify-center py-3 border-b border-gray-100 shrink-0 h-16">
                    <Link to="/">
                        <img
                            src="/BlackTextLogo.webp"
                            alt="SalesPal"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>


                {/* Nav */}
                <nav className="flex-1 overflow-y-auto pt-2 px-3 space-y-0.5">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <SidebarUserMenu />
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[240px] overflow-auto bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

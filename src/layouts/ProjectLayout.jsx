import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.webp';
import { LayoutGrid, AlertCircle, LogOut, Bell, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

const ProjectLayout = () => {
    const { activeProject, loading } = useProject();
    const { logout, user } = useAuth();
    const location = useLocation();

    const userInitials = (() => {
        const name = user?.user_metadata?.full_name || user?.email || '';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase() || '??';
    })();

    if (loading) return null;

    // Route Guard: Must have active project
    if (!activeProject) {
        return <Navigate to="/projects" replace />;
    }

    return (
        <div className="flex h-screen bg-primary overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 bg-primary/95 backdrop-blur flex items-center justify-between px-6 shrink-0 z-50">
                    <div className="flex items-center gap-4 h-full">
                        <Link to="/" className="flex items-center opacity-80 hover:opacity-100 transition-opacity">
                            <img src={logo} alt="SalesPal" className="h-8 w-auto" />
                        </Link>

                        <div className="h-6 w-px bg-white/10"></div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{activeProject.name}</span>
                            <span className="text-xs text-gray-500 border border-white/10 px-1.5 py-0.5 rounded capitalize">
                                {activeProject.industry}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                            <Bell className="w-4 h-4" />
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                        <div className="ml-2 w-7 h-7 rounded-full bg-gradient-to-tr from-secondary to-blue-500 flex items-center justify-center text-[10px] font-bold text-primary border border-secondary/20">
                            {userInitials}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProjectLayout;

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProjectSwitcher from '../components/ProjectSwitcher';
import NotificationBell from '../components/notifications/NotificationBell';

const PostSalesLayout = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar - Project Switcher & Notifications */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 overflow-visible">
                    <div className="w-64">
                        <ProjectSwitcher />
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PostSalesLayout;

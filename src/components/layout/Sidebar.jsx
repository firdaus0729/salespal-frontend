import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { sidebarConfig } from '../../navigation/sidebarConfig';
import { Settings } from 'lucide-react';

const Sidebar = () => {
    const { activeProject } = useProject();

    if (!activeProject) return null;

    return (
        <aside className="w-64 border-r border-white/5 bg-white/2 hidden md:flex flex-col h-full">
            <div className="p-4 flex-1 space-y-1">
                {sidebarConfig.map((item) => {
                    // Check visibility
                    if (!item.alwaysVisible && !activeProject.modules?.includes(item.module)) {
                        return null;
                    }

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.route}
                            to={item.route}
                            end={item.route === '/console/dashboard'} // Exact match for root dashboard
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-secondary/10 text-secondary'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
              `}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 cursor-not-allowed opacity-50">
                    <Settings className="w-4 h-4" />
                    Settings
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

import React, { useState } from 'react';
import { Settings, DollarSign, Users, CreditCard, Bell, Shield } from 'lucide-react';
import TopHeader from './components/TopHeader';
import PlatformConfig from './components/settings/PlatformConfig';
import ModulePricing from './components/settings/ModulePricing';
import UserRoles from './components/settings/UserRoles';
import BillingControl from './components/settings/BillingControl';
import NotificationsSettings from './components/settings/NotificationsSettings';
import SecurityLogs from './components/settings/SecurityLogs';

const tabs = [
    { id: 'platform',      label: 'Platform Config',  icon: Settings,    component: PlatformConfig },
    { id: 'pricing',       label: 'Pricing & Plans',  icon: DollarSign,  component: ModulePricing },
    { id: 'users',         label: 'User Roles',       icon: Users,       component: UserRoles },
    { id: 'billing',       label: 'Billing Control',  icon: CreditCard,  component: BillingControl },
    { id: 'notifications', label: 'Notifications',    icon: Bell,        component: NotificationsSettings },
    { id: 'security',      label: 'Security & Logs',  icon: Shield,      component: SecurityLogs },
];

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('platform');

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || PlatformConfig;

    return (
        <div className="flex flex-col">
            <TopHeader title="Settings" subtitle="Platform-wide system configuration" />

            <div className="p-6">
                {/* Tab Bar */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                                        isActive
                                            ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Tab Content */}
                <ActiveComponent />
            </div>
        </div>
    );
};

export default AdminSettings;

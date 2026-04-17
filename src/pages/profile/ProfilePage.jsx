import React, { useState, useEffect } from 'react';
import ProfileTab from './tabs/ProfileTab';
import SecurityTab from './tabs/SecurityTab';
import WorkspaceTab from './tabs/WorkspaceTab';
import BillingTab from './tabs/BillingTab';
import { CreditCard, User, Shield, Users } from 'lucide-react';

import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import TopHeader from '../admin/components/TopHeader';

const ProfilePage = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    
    // Get initial tab from query param if available
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profile';
    
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync tab with URL parameter changes
    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'workspace', label: 'Team / Workspace', icon: Users }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileTab />;
            case 'billing':
                return <BillingTab />;
            case 'security':
                return <SecurityTab />;
            case 'workspace':
                return <WorkspaceTab />;
            default:
                return <ProfileTab />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {isAdmin && <TopHeader title="Profile" />}
            
            <div className="p-6">
                <div className="text-gray-900">
                    {/* Page Header - Only show if not in admin context (admin context has TopHeader) */}
                    {!isAdmin && (
                        <div className="max-w-6xl mx-auto mb-8">
                            <h1 className="text-3xl font-bold">Account Settings</h1>
                            <p className="text-gray-500 mt-2">Manage your account settings and preferences</p>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className={`${!isAdmin ? 'max-w-6xl mx-auto' : ''} bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden`}>
                        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all relative focus:outline-none ${isActive
                                            ? 'text-blue-600'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                        {tab.label}
                                        
                                        {isActive && (
                                            <motion.div
                                                layoutId="profileTabUnderline"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className={`${!isAdmin ? 'max-w-6xl mx-auto' : ''} animate-fade-in-up`}>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

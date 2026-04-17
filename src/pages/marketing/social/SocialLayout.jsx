import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, FileText, Calendar, Send, BarChart2, MessageCircle, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import { useIntegrations } from '../../../context/IntegrationContext';
import SocialCreate from './SocialCreate';
import SocialList from './SocialList';
import SocialEngagementDashboard from '../components/social/SocialEngagementDashboard';

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'create', label: 'Create Post', icon: PlusCircle },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'published', label: 'Published', icon: Send },
    { id: 'engage', label: 'Engage', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const SocialLayout = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { socialPosts } = useMarketing();
    const safePosts = Array.isArray(socialPosts) ? socialPosts : [];

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <SocialOverviewInline onNavigate={setActiveTab} />;
            case 'create':
                return <SocialCreate onNavigate={setActiveTab} />;
            case 'drafts':
                return <SocialList status="drafts" onNavigate={setActiveTab} />;
            case 'scheduled':
                return <SocialList status="scheduled" onNavigate={setActiveTab} />;
            case 'published':
                return <SocialList status="published" onNavigate={setActiveTab} />;
            case 'engage':
                return <SocialEngagementDashboard posts={safePosts} />;
            case 'analytics':
                return <SocialAnalyticsPlaceholder />;
            default:
                return <SocialOverviewInline onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Social Studio</h1>
                <p className="text-gray-500 mt-1">Manage, schedule, and analyze your social content</p>
            </div>

            {/* Tab Navigation - Below Heading */}
            <div className="border-b border-gray-200 -mx-8 px-8">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-px" role="tablist">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={isActive}
                                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                                    whitespace-nowrap border-b-2 -mb-px
                                    ${isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-up">
                {renderContent()}
            </div>
        </div>
    );
};

// ==========================================
// INLINE OVERVIEW COMPONENT
// ==========================================
const SocialOverviewInline = ({ onNavigate }) => {
    const { socialPosts } = useMarketing();
    const { integrations } = useIntegrations();

    const safePosts = Array.isArray(socialPosts) ? socialPosts : [];

    const scheduledCount = safePosts.filter(p => p.status === 'scheduled').length;
    const draftsCount = safePosts.filter(p => p.status === 'draft').length;
    const publishedCount = safePosts.filter(p => p.status === 'published').length;

    const channels = [
        {
            id: 'facebook',
            name: 'Facebook Page',
            accountName: integrations.meta?.accountName || 'Not connected',
            icon: Facebook,
            iconBg: 'bg-[#1877F2]',
            connected: integrations.meta?.connected,
        },
        {
            id: 'instagram',
            name: 'Instagram Business',
            accountName: integrations.meta?.connected ? '@salespal_tech' : 'Not connected',
            icon: Instagram,
            iconBg: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
            connected: integrations.meta?.connected,
        },
        {
            id: 'linkedin',
            name: 'LinkedIn Company',
            accountName: integrations.linkedin?.accountName || 'Not connected',
            icon: Linkedin,
            iconBg: 'bg-[#0077B5]',
            connected: integrations.linkedin?.connected,
        }
    ];

    const connectedCount = channels.filter(c => c.connected).length;

    return (
        <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Drafts"
                    value={draftsCount}
                    subtext="Posts in progress"
                    color="blue"
                    onClick={() => onNavigate('drafts')}
                />
                <StatCard
                    label="Scheduled"
                    value={scheduledCount}
                    subtext="Ready to go live"
                    color="orange"
                    onClick={() => onNavigate('scheduled')}
                />
                <StatCard
                    label="Published (30d)"
                    value={publishedCount}
                    subtext="Total posts sent"
                    color="green"
                    onClick={() => onNavigate('published')}
                />
            </div>

            {/* Connected Channels */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Connected Channels</h3>
                    <span className="text-sm text-gray-500">{connectedCount} of {channels.length} connected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {channels.map(channel => {
                        const Icon = channel.icon;
                        return (
                            <div
                                key={channel.id}
                                className={`p-4 bg-white rounded-xl border border-gray-200 flex items-center gap-4 ${!channel.connected ? 'opacity-60' : ''}`}
                            >
                                <div className={`w-10 h-10 ${channel.iconBg} text-white rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                                    <p className="text-sm text-gray-500 truncate">{channel.accountName}</p>
                                </div>
                                {channel.connected ? (
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                ) : (
                                    <span className="text-xs font-medium text-blue-600">Connect</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create CTA */}
            <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">Ready to create?</h3>
                    <p className="text-sm text-gray-600 mt-1">Compose and schedule your next post</p>
                </div>
                <button
                    onClick={() => onNavigate('create')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    Create Post
                </button>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, subtext, color, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        orange: 'bg-orange-50 text-orange-600',
        green: 'bg-green-50 text-green-600',
    };
    const hoverClasses = {
        blue: 'hover:border-blue-200',
        orange: 'hover:border-orange-200',
        green: 'hover:border-green-200',
    };

    return (
        <div
            onClick={onClick}
            className={`p-6 bg-white rounded-xl border border-gray-200 cursor-pointer ${hoverClasses[color]} hover:shadow-sm transition-all group`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <div className={`w-8 h-8 rounded-full ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-xs font-bold">{value}</span>
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <p className="text-xs text-gray-400">{subtext}</p>
        </div>
    );
};

// Analytics Placeholder
const SocialAnalyticsPlaceholder = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Analytics</h3>
            <p className="text-gray-500 text-center max-w-md">
                Detailed analytics for your social content coming soon.
                Track engagement, reach, and performance across all platforms.
            </p>
        </div>
    );
};

export default SocialLayout;

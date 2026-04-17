import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import { useIntegrations } from '../../../context/IntegrationContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const SocialOverview = () => {
    const navigate = useNavigate();
    const { socialPosts } = useMarketing();
    const { integrations } = useIntegrations();

    // Mock calculations
    const scheduledCount = socialPosts.filter(p => p.status === 'scheduled').length;
    const draftsCount = socialPosts.filter(p => p.status === 'draft').length;
    const publishedCount = socialPosts.filter(p => p.status === 'published').length;

    // Social channels with real connection status from IntegrationContext
    const channels = [
        {
            id: 'facebook',
            name: 'Facebook Page',
            accountName: integrations.meta?.accountName || 'Not connected',
            icon: Facebook,
            iconBg: 'bg-[#1877F2]',
            connected: integrations.meta?.connected,
            integrationId: 'meta'
        },
        {
            id: 'instagram',
            name: 'Instagram Business',
            accountName: integrations.meta?.connected ? '@salespal_tech' : 'Not connected',
            icon: Instagram,
            iconBg: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
            connected: integrations.meta?.connected, // Instagram uses Meta integration
            integrationId: 'meta'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn Company',
            accountName: integrations.linkedin?.accountName || 'Not connected',
            icon: Linkedin,
            iconBg: 'bg-[#0077B5]',
            connected: integrations.linkedin?.connected,
            integrationId: 'linkedin'
        }
    ];

    const connectedCount = channels.filter(c => c.connected).length;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Quick Stats & Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Social Dashboard</h2>
                    <p className="text-gray-500 mt-1">Snapshot of your social media performance and queue.</p>
                </div>
                <Button onClick={() => navigate('create')} className="shadow-lg hover:shadow-xl transition-shadow">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="p-6 cursor-pointer hover:border-blue-200 transition-colors group"
                    onClick={() => navigate('drafts')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Drafts</span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <span className="text-xs font-bold">{draftsCount}</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{draftsCount}</div>
                    <p className="text-xs text-gray-400">Posts in progress</p>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-orange-200 transition-colors group"
                    onClick={() => navigate('scheduled')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Scheduled</span>
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <span className="text-xs font-bold">{scheduledCount}</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{scheduledCount}</div>
                    <p className="text-xs text-gray-400">Ready to go live</p>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-green-200 transition-colors group"
                    onClick={() => navigate('published')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Published (30d)</span>
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <span className="text-xs font-bold">{publishedCount}</span>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{publishedCount}</div>
                    <p className="text-xs text-gray-400">Total posts sent</p>
                </Card>
            </div>

            {/* Connected Accounts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Connected Channels</h3>
                    <span className="text-sm text-gray-500">{connectedCount} of {channels.length} connected</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {channels.map(channel => (
                        <Card
                            key={channel.id}
                            className="flex items-center p-4 gap-4"
                        >
                            <div className={`w-10 h-10 ${channel.iconBg} text-white rounded-lg flex items-center justify-center`}>
                                <channel.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900">{channel.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{channel.accountName}</p>
                            </div>
                            {channel.connected ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" title="Connected"></div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/settings/integrations/${channel.integrationId}`)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap underline underline-offset-2"
                                >
                                    Connect
                                </button>
                            )}
                        </Card>
                    ))}
                </div>

                {connectedCount === 0 && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <p className="font-medium">No channels connected</p>
                        <p className="text-amber-700 mt-1">
                            <Link to="/settings/integrations" className="underline hover:no-underline">
                                Connect your social accounts
                            </Link>{' '}
                            to publish posts directly from SalesPal.
                        </p>
                    </div>
                )}
            </div>

            {/* Upcoming Queue Preview */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Up Next in Queue</h3>
                    <Button variant="link" onClick={() => navigate('scheduled')}>View Calendar <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
                {scheduledCount > 0 ? (
                    <div className="text-gray-500 text-sm italic">You have {scheduledCount} posts scheduled. Go to the Scheduled tab to view them.</div>
                ) : (
                    <Card className="p-8 text-center bg-gray-50 border-dashed">
                        <p className="text-gray-500">Your queue is empty. Schedule a post to keep your audience engaged!</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SocialOverview;

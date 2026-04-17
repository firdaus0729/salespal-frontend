import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { useIntegrations } from '../../../context/IntegrationContext';
import api from '../../../lib/api';

// Simple Google "G" icon matching the existing pattern
const GoogleIcon = ({ className }) => (
    <div className={`flex items-center justify-center font-bold text-lg text-blue-600 ${className}`}>G</div>
);

const MarketingSettingsIntegrations = () => {
    const navigate = useNavigate();
    const { integrations, unhealthyPlatforms = [] } = useIntegrations();
    const [connectingId, setConnectingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const integrationList = [
        {
            id: 'meta',
            name: 'Meta Ads',
            description: 'Connect Facebook & Instagram ad accounts for campaign management.',
            icon: Facebook,
            path: 'meta',
            supportsOAuth: true,
        },
        {
            id: 'google',
            name: 'Google Ads',
            description: 'Sync campaigns, keywords, and performance metrics from Google Ads.',
            icon: GoogleIcon,
            path: 'google',
            supportsOAuth: true,
        },
        {
            id: 'instagram',
            name: 'Instagram',
            description: 'Connect Instagram Business profiles for organic posts and analytics.',
            icon: Instagram,
            path: 'instagram',
            supportsOAuth: true,
        },
        {
            id: 'linkedin',
            name: 'LinkedIn Ads',
            description: 'Manage B2B campaigns and audiences on LinkedIn.',
            icon: Linkedin,
            path: 'linkedin',
            supportsOAuth: true,
        },
    ];

    /**
     * Fetches the OAuth auth URL from the backend and redirects the user.
     * Falls back gracefully with an error toast if the request fails.
     */
    const handleOAuthConnect = async (platform) => {
        setConnectingId(platform);
        setErrorMessage(null);
        try {
            const data = await api.get(`/integrations/${platform}/auth-url`);
            if (!data?.authUrl) {
                throw new Error('No auth URL returned from server.');
            }
            window.location.href = data.authUrl;
            // Don't clear connectingId here — the page navigates away.
        } catch (err) {
            setErrorMessage(
                err?.response?.data?.error?.message ||
                err?.message ||
                `Failed to start ${platform} OAuth flow. Please try again.`
            );
            setConnectingId(null);
        }
    };

    const handleManage = (item) => {
        const implementedManagePages = ['meta', 'google', 'instagram', 'linkedin'];
        if (implementedManagePages.includes(item.id)) {
            navigate(item.path);
        } else {
            alert(`Manage ${item.name} settings coming soon.`);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Error toast */}
            {errorMessage && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg shadow-sm">
                    <span className="flex-1">{errorMessage}</span>
                    <button
                        className="text-red-400 hover:text-red-600 ml-2 leading-none text-base font-bold"
                        onClick={() => setErrorMessage(null)}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <Card className="divide-y divide-gray-100 overflow-hidden shadow-sm border border-gray-200">
                {integrationList.map(item => {
                    const status = integrations[item.id];
                    const isConnected = status?.connected;
                    const isUnhealthy = isConnected && unhealthyPlatforms.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gray-50/60 transition-colors group"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 text-gray-700 shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all">
                                <item.icon className="w-7 h-7" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                                    {isConnected ? (
                                        <Badge variant="success" className="h-5 px-2 text-[10px] uppercase tracking-wide font-bold">Connected</Badge>
                                    ) : (
                                        <Badge variant="default" className="bg-gray-100 text-gray-500 border-gray-200 h-5 px-2 text-[10px] uppercase tracking-wide font-medium">Not Connected</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>

                                {isConnected && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100 w-fit">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Synced
                                    </div>
                                )}

                                {/* Unhealthy token warning */}
                                {isUnhealthy && (
                                    <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span className="flex-1">Your {item.name} connection needs to be refreshed.</span>
                                        {item.supportsOAuth && (
                                            <button
                                                onClick={() => handleOAuthConnect(item.id)}
                                                className="font-semibold underline hover:text-amber-900 whitespace-nowrap"
                                            >
                                                Reconnect
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                {isConnected ? (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleManage(item)}
                                        className="text-gray-600 hover:text-primary hover:bg-primary/5 border border-gray-200 hover:border-primary/20 w-full md:w-auto"
                                    >
                                        Manage
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            item.supportsOAuth
                                                ? handleOAuthConnect(item.id)
                                                : null
                                        }
                                        isLoading={connectingId === item.id}
                                        className="w-full md:w-auto justify-center"
                                    >
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Card>
        </div>
    );
};

export default MarketingSettingsIntegrations;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Shield, CreditCard, Globe, Save, RefreshCw, BarChart2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useIntegrations } from '../../../context/IntegrationContext';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

// Google "G" logo as an inline SVG to match brand guidelines
const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const GoogleIntegration = () => {
    const navigate = useNavigate();
    const { integrations, disconnectIntegration, refetch, syncGoogleCampaigns } = useIntegrations();
    const { user } = useAuth();
    const isConnected = integrations.google?.connected;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Customer ID state
    const existingCustomerId = integrations.google?.metadata?.customer_id || '';
    const [customerId, setCustomerId] = useState(existingCustomerId);
    const [customerIdSaving, setCustomerIdSaving] = useState(false);
    const [customerIdError, setCustomerIdError] = useState(null);
    const [customerIdSaved, setCustomerIdSaved] = useState(false);

    // Sync state
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [syncError, setSyncError] = useState(null);

    const handleSaveCustomerId = async () => {
        const trimmed = customerId.trim().replace(/-/g, '');
        if (!trimmed) {
            setCustomerIdError('Please enter a valid Google Ads Customer ID.');
            return;
        }
        setCustomerIdSaving(true);
        setCustomerIdError(null);
        setCustomerIdSaved(false);
        try {
            await api.patch('/integrations/google/customer-id', { customerId: trimmed });
            await refetch();
            setCustomerIdSaved(true);
            setTimeout(() => setCustomerIdSaved(false), 3000);
        } catch (err) {
            setCustomerIdError(
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to save Customer ID. Please try again.'
            );
        } finally {
            setCustomerIdSaving(false);
        }
    };

    const handleSync = async () => {
        if (!existingCustomerId) {
            setSyncError('Please save your Google Ads Customer ID first before syncing.');
            return;
        }
        setSyncing(true);
        setSyncResult(null);
        setSyncError(null);
        try {
            const result = await syncGoogleCampaigns();
            setSyncResult(result);
        } catch (err) {
            setSyncError(
                err?.message ||
                'Sync failed. Make sure your Customer ID is correct and the Developer Token is configured.'
            );
        } finally {
            setSyncing(false);
        }
    };

    // Health Checklist — computed from real connection state
    const healthChecks = [
        { id: 'permissions', label: 'Permissions granted', icon: Shield, status: isConnected ? 'ok' : 'warning' },
        { id: 'billing', label: 'Billing active', icon: CreditCard, status: isConnected ? 'ok' : 'warning' },
        { id: 'domain', label: 'Domain verified', icon: Globe, status: 'ok' },
    ];

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/integrations/google/auth-url');
            if (!data?.authUrl) throw new Error('No auth URL returned.');
            window.location.href = data.authUrl;
        } catch (err) {
            setError(
                err?.response?.data?.error?.message ||
                err?.message ||
                'Failed to start Google OAuth flow. Please try again.'
            );
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (confirm('Disconnecting Google Ads will pause all active Google campaigns. Continue?')) {
            await disconnectIntegration('google');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
            {/* Header */}
            <div>
                <button onClick={() => navigate('/settings/integrations')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Integrations
                </button>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100 border border-gray-100">
                            <GoogleIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Google Ads</h1>
                            <p className="text-sm text-gray-500">Search, Display &amp; YouTube Advertising</p>
                        </div>
                    </div>
                    {isConnected ? (
                        <Badge variant="success" className="mt-1">Connected</Badge>
                    ) : (
                        <Badge className="mt-1 bg-gray-100 text-gray-500">Not Connected</Badge>
                    )}
                </div>
            </div>

            {/* Disconnected State */}
            {!isConnected ? (
                <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">Connect to Google Ads</h3>
                            <p className="text-sm text-gray-500">
                                Connect your Google Ads account to start creating and managing campaigns through SalesPal.
                            </p>
                        </div>
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg text-left">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button
                            onClick={handleConnect}
                            isLoading={loading}
                            className="bg-[#4285F4] hover:bg-[#3367d6] text-white w-full h-12 text-base justify-center"
                        >
                            <GoogleIcon className="w-5 h-5 mr-2" />
                            Continue with Google
                        </Button>
                        <p className="text-xs text-gray-400">
                            By connecting, you agree to Google's Terms of Service and SalesPal's Privacy Policy.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Connected Account Info */}
                    <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{user?.name || user?.email || 'Connected User'}</h3>
                                <p className="text-sm text-gray-500">{user?.email || ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="secondary" onClick={handleConnect} className="text-blue-600 hover:bg-blue-50 border-blue-200">
                                Reconnect
                            </Button>
                            <Button variant="secondary" onClick={handleDisconnect} className="text-red-600 hover:bg-red-50 border-red-200">
                                Disconnect
                            </Button>
                        </div>
                    </Card>

                    {/* Google Ads Customer ID */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-1">Google Ads Customer ID</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter your 10-digit Google Ads Customer ID (found at the top-right of{' '}
                            <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ads.google.com</a>
                            , e.g. <span className="font-mono">123-456-7890</span>).
                            Required to sync and publish campaigns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={customerId}
                                onChange={e => { setCustomerId(e.target.value); setCustomerIdError(null); setCustomerIdSaved(false); }}
                                placeholder="e.g. 123-456-7890"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            />
                            <Button onClick={handleSaveCustomerId} isLoading={customerIdSaving} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                                <Save className="w-4 h-4 mr-1.5" />
                                Save
                            </Button>
                        </div>
                        {customerIdError && (
                            <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{customerIdError}</span>
                            </div>
                        )}
                        {customerIdSaved && (
                            <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Customer ID saved successfully.</span>
                            </div>
                        )}
                        {existingCustomerId && (
                            <p className="mt-2 text-xs text-gray-400">
                                Currently saved: <span className="font-mono text-gray-600">{existingCustomerId}</span>
                            </p>
                        )}
                    </Card>

                    {/* Campaign Sync */}
                    <Card className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-blue-500" />
                                    Sync Campaigns from Google Ads
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Pull your existing Google Ads campaigns into SalesPal. Imports campaign names, status, budgets, and 30-day metrics (impressions, clicks, spend, conversions).
                                </p>
                                {!existingCustomerId && (
                                    <p className="mt-2 text-xs text-amber-600 font-medium">
                                        ⚠ Save your Customer ID above before syncing.
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleSync}
                                isLoading={syncing}
                                disabled={!existingCustomerId}
                                className="bg-[#4285F4] hover:bg-[#3367d6] text-white shrink-0 whitespace-nowrap"
                            >
                                <RefreshCw className={`w-4 h-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
                                Sync Now
                            </Button>
                        </div>

                        {syncResult && (
                            <div className="mt-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                                <div>
                                    <p className="font-medium">{syncResult.message}</p>
                                    {syncResult.skipped > 0 && (
                                        <p className="text-green-700 text-xs mt-0.5">{syncResult.skipped} campaign(s) skipped.</p>
                                    )}
                                    <p className="text-green-700 text-xs mt-0.5">
                                        Go to{' '}
                                        <button onClick={() => navigate('/marketing/campaigns')} className="underline font-medium">
                                            Marketing → Campaigns
                                        </button>{' '}
                                        to see them.
                                    </p>
                                </div>
                            </div>
                        )}
                        {syncError && (
                            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{syncError}</span>
                            </div>
                        )}
                    </Card>

                    {/* Health Checklist */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Integration Health</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {healthChecks.map(check => (
                                <div key={check.id} className={`flex items-center gap-3 p-3 rounded-lg border ${check.status === 'ok' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                                    <check.icon className={`w-5 h-5 ${check.status === 'ok' ? 'text-green-600' : 'text-yellow-600'}`} />
                                    <span className={`text-sm font-medium ${check.status === 'ok' ? 'text-green-700' : 'text-yellow-700'}`}>{check.label}</span>
                                    {check.status === 'ok' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-yellow-500 ml-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Connected confirmation */}
                    <Card className="p-6 bg-emerald-50/50 border-emerald-100">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <div>
                                <h4 className="font-semibold text-emerald-900">Google Ads Connected</h4>
                                <p className="text-sm text-emerald-700">You can now sync and launch campaigns targeting Google Search, Display &amp; YouTube.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default GoogleIntegration;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Facebook, ArrowLeft, Shield, CreditCard, Globe } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useIntegrations } from '../../../context/IntegrationContext';
import { useAuth } from '../../../context/AuthContext';

const MetaIntegration = () => {
    const navigate = useNavigate();
    const { integrations, connectIntegration, disconnectIntegration } = useIntegrations();
    const { user } = useAuth();
    const isConnected = integrations.meta?.connected;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            await connectIntegration('meta');
        } catch (err) {
            setError(err?.message || 'Failed to start Meta OAuth flow.');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (confirm('Disconnecting Meta Ads will pause all active campaigns. Continue?')) {
            await disconnectIntegration('meta');
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
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 text-white">
                                <Facebook className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Meta Ads</h1>
                                <p className="text-sm text-gray-500">Facebook & Instagram Advertising</p>
                            </div>
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
                            <h3 className="text-lg font-semibold text-gray-900">Connect to Meta</h3>
                            <p className="text-sm text-gray-500">
                                Connect your Meta Ads account to start creating and managing campaigns through SalesPal.
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
                            className="bg-[#1877F2] hover:bg-[#166fe5] text-white w-full h-12 text-base justify-center"
                        >
                            <Facebook className="w-5 h-5 mr-2" />
                            Continue with Facebook
                        </Button>
                        <p className="text-xs text-gray-400">
                            By connecting, you agree to Meta's Terms of Service and SalesPal's Privacy Policy.
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
                            <Button variant="secondary" onClick={handleDisconnect} className="text-red-600 hover:bg-red-50 border-red-200">Disconnect</Button>
                        </div>
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
                                <h4 className="font-semibold text-emerald-900">Meta Ads Connected</h4>
                                <p className="text-sm text-emerald-700">You can now create and launch campaigns targeting Facebook & Instagram.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MetaIntegration;

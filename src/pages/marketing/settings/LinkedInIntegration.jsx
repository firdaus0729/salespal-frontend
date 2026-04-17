import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Linkedin, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useIntegrations } from '../../../context/IntegrationContext';

const LinkedInIntegration = () => {
    const navigate = useNavigate();
    const { integrations, disconnectIntegration, refetch } = useIntegrations();
    const isConnected = integrations.linkedin?.connected;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
            const api = (await import('../../../lib/api')).default;
            const data = await api.get('/integrations/linkedin/auth-url');
            if (!data?.authUrl) throw new Error('No auth URL returned.');
            window.location.href = data.authUrl;
        } catch (err) {
            setError(err?.message || 'Failed to start LinkedIn OAuth flow.');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect LinkedIn integration?')) return;
        await disconnectIntegration('linkedin');
        await refetch();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
            <div className="flex items-start justify-between">
                <div>
                    <button onClick={() => navigate('/settings/integrations')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Integrations
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0077B5] rounded-xl flex items-center justify-center text-white">
                            <Linkedin className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Ads</h1>
                            <p className="text-sm text-gray-500">B2B ads connection</p>
                        </div>
                    </div>
                </div>
                {isConnected ? <Badge variant="success" className="mt-1">Connected</Badge> : <Badge className="mt-1 bg-gray-100 text-gray-500">Not Connected</Badge>}
            </div>

            {!isConnected ? (
                <Card className="p-10 text-center border-dashed border-2 bg-gray-50/50">
                    <p className="text-sm text-gray-500 mb-5">Connect LinkedIn Ads to run and manage B2B campaigns from SalesPal.</p>
                    {error && (
                        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    <Button onClick={handleConnect} isLoading={loading} className="bg-[#0077B5] hover:bg-[#006399] text-white">
                        Continue with LinkedIn
                    </Button>
                </Card>
            ) : (
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">LinkedIn integration is active.</span>
                        </div>
                        <Button variant="secondary" onClick={handleDisconnect} className="text-red-600 hover:bg-red-50 border-red-200">
                            Disconnect
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LinkedInIntegration;

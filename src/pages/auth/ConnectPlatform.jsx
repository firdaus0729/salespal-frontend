import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import api from '../../lib/api';

/**
 * ConnectPlatform — OAuth callback handler.
 *
 * Facebook (and future platforms) redirect back to:
 *   /connect/:platformId?code=...&state=...
 *
 * This component:
 *   1. Reads `code` and `state` from the URL search params.
 *   2. POSTs them to /api/integrations/:platformId/callback.
 *   3. On success → navigates to /settings/integrations.
 *   4. On error  → navigates to /settings/integrations?error=connect_failed.
 *   5. Shows a loading spinner while in progress.
 *   6. If no `code` param is present, renders an "Authorization failed" state.
 */
const ConnectPlatform = () => {
    const { platformId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 'loading' | 'success' | 'error' | 'no_code'
    const [status, setStatus] = useState('loading');
    const [errorDetail, setErrorDetail] = useState('');

    const platformNames = {
        meta: 'Meta Ads (Facebook & Instagram)',
        facebook: 'Meta Ads (Facebook & Instagram)',
        google: 'Google Ads',
        linkedin: 'LinkedIn Ads',
        instagram: 'Instagram Professional',
    };

    const platformLabel = platformNames[platformId] || 'Platform';

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const oauthError = searchParams.get('error');

        // Facebook / provider denied the request
        if (oauthError) {
            setErrorDetail(searchParams.get('error_description') || oauthError);
            setStatus('no_code');
            return;
        }

        if (!code) {
            setStatus('no_code');
            return;
        }

        const exchange = async () => {
            try {
                await api.post(`/integrations/${platformId}/callback`, { code, state });
                setStatus('success');
                setTimeout(() => {
                    navigate('/settings/integrations');
                }, 1200);
            } catch (err) {
                const msg =
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    'An unexpected error occurred.';
                setErrorDetail(msg);
                setStatus('error');
                setTimeout(() => {
                    navigate('/settings/integrations?error=connect_failed');
                }, 2000);
            }
        };

        exchange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderBody = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Connecting {platformLabel}…
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Verifying your authorization and saving your integration…
                        </p>
                    </>
                );

            case 'success':
                return (
                    <>
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Connected!</h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            Redirecting you back to settings…
                        </p>
                    </>
                );

            case 'error':
                return (
                    <>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Connection Failed</h1>
                        {errorDetail && (
                            <p className="text-red-500 mt-2 text-sm">{errorDetail}</p>
                        )}
                        <p className="text-gray-400 mt-1 text-xs">Redirecting back to settings…</p>
                    </>
                );

            case 'no_code':
            default:
                return (
                    <>
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Authorization Failed</h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            {errorDetail ||
                                'No authorization code was received. The request may have been cancelled or denied.'}
                        </p>
                        <button
                            className="mt-5 text-sm text-blue-600 hover:underline"
                            onClick={() => navigate('/settings/integrations')}
                        >
                            ← Back to Integrations
                        </button>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 text-center space-y-2">
                <div className="flex flex-col items-center">
                    {renderBody()}
                </div>
            </Card>
        </div>
    );
};

export default ConnectPlatform;

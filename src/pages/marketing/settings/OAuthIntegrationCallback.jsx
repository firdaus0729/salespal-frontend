import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useIntegrations } from '../../../context/IntegrationContext';
import api from '../../../lib/api';

const LABELS = {
    meta: 'Meta Ads',
    google: 'Google Ads',
    instagram: 'Instagram',
    linkedin: 'LinkedIn Ads',
};

const OAuthIntegrationCallback = () => {
    const navigate = useNavigate();
    const { platformId } = useParams();
    const [searchParams] = useSearchParams();
    const { refetch } = useIntegrations();
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasRun = useRef(false);
    const platform = String(platformId || '').toLowerCase();
    const label = LABELS[platform] || 'Integration';

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            const oauthError = searchParams.get('error');
            if (oauthError) {
                setErrorMessage(
                    oauthError === 'access_denied'
                        ? `You denied access to ${label}.`
                        : `${label} returned an error: ${oauthError}`
                );
                setStatus('error');
                return;
            }

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            if (!code || !state) {
                setErrorMessage('Missing OAuth code or state. Please reconnect.');
                setStatus('error');
                return;
            }

            try {
                await api.post(`/integrations/${platform}/callback`, { code, state });
                await refetch();
                setStatus('success');
                setTimeout(() => navigate(`/settings/integrations/${platform}`, { replace: true }), 1200);
            } catch (err) {
                setErrorMessage(err?.message || `Failed to complete ${label} connection.`);
                setStatus('error');
            }
        };

        run();
    }, [label, navigate, platform, refetch, searchParams]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full text-center space-y-6 p-8">
                {status === 'loading' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Connecting {label}…</h2>
                            <p className="text-sm text-gray-500 mt-1">Exchanging authorization with provider.</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{label} Connected!</h2>
                            <p className="text-sm text-gray-500 mt-1">Redirecting to settings…</p>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="flex justify-center">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Connection Failed</h2>
                            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/settings/integrations/${platform}`, { replace: true })}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Integration
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthIntegrationCallback;

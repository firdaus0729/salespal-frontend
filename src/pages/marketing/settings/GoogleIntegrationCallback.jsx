import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useIntegrations } from '../../../context/IntegrationContext';
import api from '../../../lib/api';

/**
 * GoogleIntegrationCallback
 *
 * Mounted at /settings/integrations/google/callback
 * Google redirects here with ?code=...&state=... after user grants consent.
 *
 * Flow:
 *  1. Read code + state from URL query params.
 *  2. POST to backend /integrations/google/callback to exchange code for tokens.
 *  3. Refresh IntegrationContext so connected state flips to true.
 *  4. Navigate to /settings/integrations/google with success flag.
 */
const GoogleIntegrationCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refetch } = useIntegrations();

    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    // Prevent double-execution in React StrictMode
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const handleCallback = async () => {
            // 1. Check for OAuth error from Google
            const oauthError = searchParams.get('error');
            if (oauthError) {
                setErrorMessage(
                    oauthError === 'access_denied'
                        ? 'You denied access to Google Ads. Please try again.'
                        : `Google returned an error: ${oauthError}`
                );
                setStatus('error');
                return;
            }

            // 2. Extract code and state
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) {
                setErrorMessage('Missing OAuth code or state parameter. Please try connecting again.');
                setStatus('error');
                return;
            }

            try {
                // 3. Exchange code for tokens via backend
                await api.post('/integrations/google/callback', { code, state });

                // 4. Refresh integration context so UI reflects connected state
                await refetch();

                setStatus('success');

                // 5. Redirect to Google integration page after short delay
                setTimeout(() => {
                    navigate('/settings/integrations/google', { replace: true });
                }, 1500);
            } catch (err) {
                const msg =
                    err?.message ||
                    'Failed to complete Google connection. Please try again.';
                setErrorMessage(msg);
                setStatus('error');
            }
        };

        handleCallback();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full text-center space-y-6 p-8">
                {status === 'loading' && (
                    <>
                        <div className="flex justify-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Connecting Google Ads…</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Exchanging authorization code with Google. Please wait.
                            </p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Google Ads Connected!</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Your account has been successfully linked. Redirecting…
                            </p>
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
                            onClick={() => navigate('/settings/integrations/google', { replace: true })}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Google Integration
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GoogleIntegrationCallback;

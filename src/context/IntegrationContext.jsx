import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

/**
 * IntegrationContext — Supabase-backed integration state.
 * Uses user_id (not org_id) for RLS simplicity.
 * No OAuth, no sessionStorage, no redirects.
 * Table: integrations (user_id, platform, status)
 */

const IntegrationContext = createContext();

const PLATFORM_DEFAULTS = {
    meta: { name: 'Meta Ads', description: 'Facebook & Instagram advertising' },
    google: { name: 'Google Ads', description: 'Search and display advertising' },
    instagram: { name: 'Instagram', description: 'Organic posts and stories' },
    linkedin: { name: 'LinkedIn Ads', description: 'B2B advertising and campaigns' }
};
const OAUTH_PLATFORMS = new Set(['meta', 'google', 'instagram', 'linkedin']);

export const IntegrationProvider = ({ children }) => {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState({});
    const [loading, setLoading] = useState(true);
    const [unhealthyPlatforms, setUnhealthyPlatforms] = useState([]);

    // Fetch all integrations for the user
    const fetchIntegrations = useCallback(async () => {
        if (!user) { setIntegrations({}); setLoading(false); return; }
        setLoading(true);

        try {
            const raw = await api.get('/integrations');
            // Backend returns { integrations: [...] } — normalise to plain array
            const data = Array.isArray(raw) ? raw : (raw?.integrations ?? []);
            const map = {};
            data.forEach(row => {
                map[row.platform] = {
                    id: row.id,
                    platform_id: row.platform,
                    name: PLATFORM_DEFAULTS[row.platform]?.name || row.platform,
                    description: PLATFORM_DEFAULTS[row.platform]?.description || '',
                    connected: row.status === 'connected',
                    connectedAt: row.connected_at || row.created_at,
                    status: row.status,
                    metadata: row.metadata || {},
                };
            });
            setIntegrations(map);
        } catch (err) {
            console.error('Error fetching integrations:', err);
            setIntegrations({});
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Check token health for connected platforms
    const checkHealth = useCallback(async () => {
        if (!user) return;
        try {
            const health = await api.get('/integrations/health');
            const unhealthy = [];
            // facebook maps to 'meta' key in integrations
            if (health?.facebook?.connected && !health?.facebook?.healthy) unhealthy.push('meta');
            if (health?.google?.connected   && !health?.google?.healthy)   unhealthy.push('google');
            setUnhealthyPlatforms(unhealthy);
        } catch {
            // Silently ignore — health check failure must not break the app
        }
    }, [user]);

    useEffect(() => {
        const init = async () => {
            await fetchIntegrations();
            await checkHealth();
        };
        init();
    }, [fetchIntegrations, checkHealth]);

    // Connect platform
    const connectIntegration = useCallback(async (platformId, authCode = null) => {
        if (!user) return;

        if (!authCode && OAUTH_PLATFORMS.has(String(platformId || '').toLowerCase())) {
            const data = await api.get(`/integrations/${platformId}/auth-url`);
            if (!data?.authUrl) {
                throw new Error(`No OAuth URL returned for ${platformId}.`);
            }
            window.location.href = data.authUrl;
            return { redirected: true };
        }

        // Optimistic update
        setIntegrations(prev => ({
            ...prev,
            [platformId]: {
                ...(prev[platformId] || {}),
                platform_id: platformId,
                name: PLATFORM_DEFAULTS[platformId]?.name || platformId,
                connected: true,
                connectedAt: new Date().toISOString(),
                status: 'connected',
            }
        }));

        try {
            await api.put(`/integrations/${platformId}`, { accessToken: authCode });
        } catch (error) {
            console.error('Error connecting integration:', error);
            await fetchIntegrations(); // rollback
        }
    }, [user, fetchIntegrations]);

    // Disconnect platform
    const disconnectIntegration = useCallback(async (platformId) => {
        if (!user) return;

        // Optimistic update
        setIntegrations(prev => {
            const next = { ...prev };
            delete next[platformId];
            return next;
        });

        try {
            await api.delete(`/integrations/${platformId}`);
        } catch (error) {
            console.error('Error disconnecting integration:', error);
            await fetchIntegrations(); // rollback
        }
    }, [user, fetchIntegrations]);

    const isConnected = useCallback((id) => {
        return integrations[id]?.connected ?? false;
    }, [integrations]);

    const getIntegration = useCallback((id) => {
        return integrations[id] ?? null;
    }, [integrations]);

    const validateIntegrations = useCallback((platforms = []) => {
        const errors = [];
        if (platforms.includes('facebook') || platforms.includes('meta')) {
            if (!integrations.meta?.connected) {
                errors.push({ id: 'meta', message: 'Meta Ads integration required for Facebook campaigns' });
            }
        }
        if (platforms.includes('google')) {
            if (!integrations.google?.connected) {
                errors.push({ id: 'google', message: 'Google Ads integration required for Google campaigns' });
            }
        }
        if (platforms.includes('instagram')) {
            if (!integrations.meta?.connected && !integrations.instagram?.connected) {
                errors.push({ id: 'instagram', message: 'Meta Ads or Instagram integration required for Instagram' });
            }
        }
        if (platforms.includes('linkedin')) {
            if (!integrations.linkedin?.connected) {
                errors.push({ id: 'linkedin', message: 'LinkedIn Ads integration required for LinkedIn campaigns' });
            }
        }
        return { valid: errors.length === 0, errors };
    }, [integrations]);

    const syncGoogleCampaigns = useCallback(async () => {
        const result = await api.post('/integrations/google/sync', {});
        await fetchIntegrations(); // refresh so last_synced_at updates
        return result;
    }, [fetchIntegrations]);

    const value = useMemo(() => ({
        integrations,
        loading,
        unhealthyPlatforms,
        connectIntegration,
        disconnectIntegration,
        isConnected,
        getIntegration,
        validateIntegrations,
        refetch: fetchIntegrations,
        recheckHealth: checkHealth,
        syncGoogleCampaigns,
    }), [integrations, loading, unhealthyPlatforms, connectIntegration, disconnectIntegration, isConnected, getIntegration, validateIntegrations, fetchIntegrations, checkHealth, syncGoogleCampaigns]);

    return (
        <IntegrationContext.Provider value={value}>
            {children}
        </IntegrationContext.Provider>
    );
};

export const useIntegrations = () => {
    const context = useContext(IntegrationContext);
    if (!context) {
        throw new Error('useIntegrations must be used within an IntegrationProvider');
    }
    return context;
};

export default IntegrationContext;

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const OrgContext = createContext();

export const useOrg = () => {
    const context = useContext(OrgContext);
    if (!context) {
        throw new Error('useOrg must be used within an OrgProvider');
    }
    return context;
};

export const OrgProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [org, setOrg] = useState(null);
    const [orgId, setOrgId] = useState(null);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    const bootstrap = useCallback(async () => {
        if (!user) {
            setOrg(null);
            setOrgId(null);
            setMembership(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Try to find existing org membership
            let orgData = null;
            try {
                orgData = await api.get('/users/me/org');
            } catch (err) {
                if (err.status !== 404) {
                    console.error('Org members query error:', err);
                }
            }

            if (!orgData) {
                // No org — call server-side bootstrap endpoint
                console.log('No org found, calling bootstrap API...');
                const userName = user.user_metadata?.full_name || user.fullName || user.email?.split('@')[0] || 'My';
                const orgName = `${userName}'s Workspace`;

                try {
                    orgData = await api.post('/users/me/org', { name: orgName });
                } catch (rpcError) {
                    console.error('Bootstrap API failed:', rpcError);
                    setLoading(false);
                    return;
                }
                
                // Note: The POST /me/org returns the org object directly, 
                // but we fetch it again just to ensure we have the role 
                // structured the exact same way as the GET endpoint
                try {
                    orgData = await api.get('/users/me/org');
                } catch (e) {
                     console.error('Failed to refetch org after bootstrap:', e);
                }
            }

            if (orgData) {
                setOrg(orgData);
                setOrgId(orgData.id);
                setMembership({ role: orgData.user_role });
            }

        } catch (err) {
            console.error('Org bootstrap error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) {
            bootstrap();
        } else {
            setOrg(null);
            setOrgId(null);
            setMembership(null);
            setLoading(false);
        }
    }, [isAuthenticated, bootstrap]);

    // Manual create org (for settings/onboarding page)
    const createOrganization = useCallback(async (name) => {
        if (!user) throw new Error('Must be authenticated');

        const result = await api.post('/users/me/org', { name });
        // Re-fetch to populate state
        await bootstrap();
        return result;
    }, [user, bootstrap]);

    const value = useMemo(() => ({
        org,
        orgId,
        membership,
        loading,
        createOrganization,
        refetch: bootstrap,
    }), [org, orgId, membership, loading, createOrganization, bootstrap]);

    return (
        <OrgContext.Provider value={value}>
            {children}
        </OrgContext.Provider>
    );
};

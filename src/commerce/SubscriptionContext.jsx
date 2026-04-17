import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { MODULES } from './commerce.config';


/**
 * SubscriptionContext — Supabase-backed subscription + credit management.
 *
 * DB tables used:
 *   - subscriptions  (user_id, org_id, module, plan, status, activated_at, expires_at)
 *   - marketing_credits (org_id, balance)
 *   - credit_transactions (org_id, type, amount, balance_after, reference_type)
 *
 * DB functions used:
 *   - consume_credit(p_org_id, p_type, p_amount)  → boolean
 *   - add_credit(p_org_id, p_amount, p_source)    → void
 *
 * RLS: subscriptions rows are scoped by user_id = auth.uid()
 */

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState({});
    const [credits, setCredits] = useState({ balance: 0 });
    const [loading, setLoading] = useState(true);
    const [fetchedUserId, setFetchedUserId] = useState(null);

    // ─── Fetch subscriptions + credits from API ───
    const fetchAll = useCallback(async () => {
        if (!user) {
            setSubscriptions({});
            setCredits({ balance: 0 });
            setFetchedUserId(null);
            setLoading(false);
            return;
        }
        setLoading(true);



        try {
            const [subRes, creditRes] = await Promise.all([
                api.get('/billing/subscriptions'),
                api.get('/billing/credits')
            ]);

            // Build subscriptions map keyed by module
            const subMap = {};
            (subRes || []).forEach(row => {
                subMap[row.module] = {
                    id: row.id,
                    module: row.module,
                    plan: row.plan,
                    status: row.status,
                    active: row.status === 'active' || row.status === 'trial',
                    activatedAt: row.activated_at,
                    expiresAt: row.expires_at,
                    limits: MODULES[row.module]?.limits || null,
                };
            });
            setSubscriptions(subMap);
            setCredits({ balance: creditRes?.balance ?? 0 });
            setFetchedUserId(user.id);
        } catch (err) {
            console.error('SubscriptionContext fetchAll error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Derived loading state to prevent race conditions during auth transitions
    const isReady = !user || fetchedUserId === user.id;
    const contextLoading = loading || !isReady;

    // ─── Subscription management ───

    const activateSubscription = useCallback(async (input) => {
        if (!user) return;
        const moduleIds = [];

        if (typeof input === 'string') {
            moduleIds.push(input);
        } else {
            const moduleKey = input.module || input.moduleId;
            const productId = input.productId || input.id;
            if (productId === 'salespal-360' || input.type === 'bundle') {
                moduleIds.push('marketing', 'sales', 'postSale', 'support', 'salespal360');
            } else if (moduleKey) {
                moduleIds.push(moduleKey);
            }
        }



        for (const moduleId of moduleIds) {
            try {
                await api.post('/billing/subscriptions/activate', { moduleId });
            } catch (error) {
                console.error(`Failed to activate subscription for ${moduleId}:`, error);
            }
        }

        await fetchAll();
    }, [user, fetchAll]);

    const deactivateSubscription = useCallback(async (moduleId) => {
        if (!user) return;
        try {
            await api.post(`/billing/subscriptions/${moduleId}/deactivate`);
            await fetchAll();
        } catch (error) {
            console.error('Failed to deactivate subscription:', error);
        }
    }, [user, fetchAll]);

    const pauseSubscription = useCallback(async (moduleId) => {
        if (!user) return;
        try {
            await api.post(`/billing/subscriptions/${moduleId}/pause`);
            await fetchAll();
        } catch (error) {
            console.error('Failed to pause subscription:', error);
        }
    }, [user, fetchAll]);

    const resumeSubscription = useCallback(async (moduleId) => {
        if (!user) return;
        try {
            await api.post(`/billing/subscriptions/${moduleId}/resume`);
            await fetchAll();
        } catch (error) {
            console.error('Failed to resume subscription:', error);
        }
    }, [user, fetchAll]);

    const isModuleActive = useCallback((moduleId) => {
        return !!subscriptions[moduleId]?.active;
    }, [subscriptions]);

    const getSubscription = useCallback((moduleId) => {
        return subscriptions[moduleId] || null;
    }, [subscriptions]);

    // ─── Credit management ───

    const consume = useCallback(async (moduleId, type) => {
        if (!isModuleActive(moduleId)) return false;

        try {
            await api.post('/billing/credits/consume', { type });
            setCredits(prev => ({ balance: Math.max(0, prev.balance - 1) }));
            return true;
        } catch (error) {
            console.error('consume_credit error:', error);
            return false;
        }
    }, [isModuleActive]);

    const addCredits = useCallback(async (moduleId, resource, amount) => {


        try {
            await api.post('/billing/credits/add', { amount: Number(amount) });
            setCredits(prev => ({ balance: prev.balance + Number(amount) }));
            return true;
        } catch (error) {
            console.error('addCredits error:', error);
            return false;
        }
    }, []);

    /**
     * getRemaining — returns the aggregate credit balance.
     * NOTE: The backend currently stores a single balance — not per-type.
     * `moduleId` and `type` params are accepted for future per-type API compatibility
     * but are not yet used for filtering. See marketing_credits table.
     */
    const getRemaining = useCallback((_moduleId, _type) => {
        return credits.balance;
    }, [credits.balance]);

    /**
     * canConsume — returns true if the module is active AND balance > 0.
     * NOTE: Does not check per-type availability — same caveat as getRemaining.
     */
    const canConsume = useCallback((moduleId, _type) => {
        return isModuleActive(moduleId) && credits.balance > 0;
    }, [isModuleActive, credits.balance]);

    const clearCartAfterPurchase = () => {
        try { localStorage.removeItem('salespal_cart'); } catch { /* noop */ }
    };

    const value = useMemo(() => ({
        subscriptions,
        credits,
        loading: contextLoading,
        activateSubscription,
        deactivateSubscription,
        pauseSubscription,
        resumeSubscription,
        isModuleActive,
        getSubscription,
        consume,
        addCredits,
        getRemaining,
        canConsume,
        clearCartAfterPurchase,
        refetch: fetchAll,
    }), [
        subscriptions, credits, loading,
        fetchAll,
        activateSubscription, deactivateSubscription, pauseSubscription, resumeSubscription,
        isModuleActive, getSubscription,
        consume, addCredits, getRemaining, canConsume,
    ]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

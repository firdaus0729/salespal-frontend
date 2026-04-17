import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useOrg } from './OrgContext';
import { useAuth } from './AuthContext';

/**
 * useCampaignContext — internal hook, consumed only by MarketingProvider.
 * Owns all campaign CRUD, AI action stubs, and the fetchCampaigns + launchCampaign
 * dependency on the wizard. Extracted from MarketingContext (Phase 4).
 *
 * @param {string|null} selectedProjectId — passed in from MarketingProvider local state
 * @param {Function}    onLaunchSuccess   — called after launch_campaign RPC succeeds
 */
export function useCampaignContext(selectedProjectId, onLaunchSuccess) {
    const { orgId } = useOrg();
    const { user } = useAuth();

    const [campaigns, setCampaigns] = useState([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        if (!orgId) { setCampaigns([]); setCampaignsLoading(false); return; }
        setCampaignsLoading(true);
        try {
            const data = await api.get('/marketing/campaigns');
            setCampaigns(data || []);
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
            setCampaigns([]);
        }
        setCampaignsLoading(false);
    }, [orgId]);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const createCampaign = async (campaignData) => {
        if (!orgId) return null;
        const projectId = campaignData.projectId || campaignData.project_id || selectedProjectId;

        try {
            const data = await api.post('/marketing/campaigns', {
                name: campaignData.name,
                projectId: projectId,
                platform: campaignData.platform || 'meta',
                objective: campaignData.objective || null,
                status: campaignData.status || 'draft',
                dailyBudget: campaignData.dailyBudget || campaignData.daily_budget || null,
                totalBudget: campaignData.totalBudget || campaignData.total_budget || null,
                startDate: campaignData.startDate || campaignData.start_date || null,
                endDate: campaignData.endDate || campaignData.end_date || null
            });

            if (data) setCampaigns(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Failed to create campaign', error);
            return null;
        }
    };

    const getCampaignById = (id) => campaigns.find(c => c.id === id) || null;

    const updateCampaignData = async (campaignId, updates) => {
        // Map camelCase to snake_case for known fields, although API takes camelCase too,
        // we just pass updates directly as api handles mapping in controller
        try {
            const data = await api.put(`/marketing/campaigns/${campaignId}`, updates);
            if (data) setCampaigns(prev => prev.map(c => c.id === campaignId ? data : c));
            return data;
        } catch (error) {
            console.error('Failed to update campaign', error);
            return null;
        }
    };

    const deleteCampaign = async (campaignId) => {
        try {
            await api.delete(`/marketing/campaigns/${campaignId}`);
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        } catch (error) {
            console.error('Failed to delete campaign', error);
        }
    };

    const getCampaignsByProject = (projectId) =>
        campaigns.filter(c => c.project_id === projectId);

    // ─── AI Actions (stub — will be fully wired in Phase E) ───
    const applyAIAction = async (campaignId, actionType) => {
        const campaign = getCampaignById(campaignId);
        if (!campaign) return;

        let updates = {};
        switch (actionType) {
            case 'SCALE_CAMPAIGN': {
                const currentBudget = Number(campaign.daily_budget) || 0;
                updates = { daily_budget: Math.floor(currentBudget * 1.2) };
                break;
            }
            case 'OPTIMIZE_BUDGET':
                // Will call AI edge function in Phase E
                break;
            case 'ROTATE_CREATIVES':
                // Will call AI edge function in Phase E
                break;
            default:
                break;
        }

        if (Object.keys(updates).length) {
            return await updateCampaignData(campaignId, updates);
        }
        return campaign;
    };

    return {
        campaigns,
        campaignsLoading,
        createCampaign,
        updateCampaign: updateCampaignData,
        deleteCampaign,
        getCampaignById,
        getCampaignsByProject,
        applyAIAction,
        // Exposed so useWizard can call fetchCampaigns after launchCampaign
        refetchCampaigns: fetchCampaigns,
    };
}

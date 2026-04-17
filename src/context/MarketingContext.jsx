import React, { createContext, useContext, useState, useMemo } from 'react';
import { useOrg } from './OrgContext';
import { useAuth } from './AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useCampaignContext } from './CampaignContext';
import { useSocialContext } from './SocialContext';
import { useWizard } from '../hooks/useWizard';

/**
 * MarketingContext — Composer layer.
 *
 * After Phase 4 refactor this file is a thin composition of three focused hooks:
 *   - useCampaignContext  → campaigns CRUD + AI actions
 *   - useSocialContext    → social posts CRUD with optimistic updates
 *   - useWizard          → campaign draft state machine
 *
 * Projects are still delegated to useProjects() (Phase 2 change).
 * `useMarketing()` API is 100% unchanged — all consumers work without modification.
 */
const MarketingContext = createContext();

export const MarketingProvider = ({ children }) => {
    const { orgId } = useOrg();
    const { user } = useAuth();

    // ─── Projects — delegated to useProjects (single source of truth) ───
    const {
        projects,
        loading: projectsLoading,
        getProjectById,
        createProject: _createProject,
        updateProject: _updateProject,
        archiveProject,
    } = useProjects();

    // selectedProjectId stays local — threaded into campaign and social hooks
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const selectProject = (projectId) => setSelectedProjectId(projectId);

    // ─── Compare Mode ─────────────────────────────────────────────────────────────
    const [compareMode, setCompareMode] = useState(false);
    const [compareConfig, setCompareConfig] = useState({
        type: 'time', // future: channel, campaign, project
        comparisonType: 'previous_period', // future extensibility
        customRange: null
    });

    const toggleCompareMode = () => setCompareMode(prev => !prev);
    
    const resetCompare = () => {
        setCompareMode(false);
        setCompareConfig({
            type: 'time',
            comparisonType: 'previous_period',
            customRange: null
        });
    };

    // Thin wrappers that preserve the original return shape for all existing consumers
    const createProject = async (projectData) => {
        const { data } = await _createProject(projectData);
        return data;
    };

    const updateProject = async (projectId, updates) => {
        const { data } = await _updateProject(projectId, updates);
        return data;
    };

    const deleteProject = async (projectId) => {
        await archiveProject(projectId);
        if (selectedProjectId === projectId) setSelectedProjectId(null);
    };

    // ─── Campaigns ───────────────────────────────────────────────────────────────
    const {
        campaigns,
        campaignsLoading,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        getCampaignById,
        getCampaignsByProject,
        applyAIAction,
        refetchCampaigns,
    } = useCampaignContext(selectedProjectId);

    // ─── Social Posts ─────────────────────────────────────────────────────────────
    const {
        socialPosts,
        socialPostsLoading,
        addSocialPost,
        updateSocialPost,
        deleteSocialPost,
    } = useSocialContext(selectedProjectId);

    // ─── Campaign Draft Wizard ────────────────────────────────────────────────────
    const {
        activeDraft,
        isSaving,
        lastSaved,
        startNewDraft,
        updateDraftStep,
        debouncedUpdateDraftData,
        setDraftStepIndex,
        canAccessStep,
        launchCampaign,
        cancelDraft,
        resumeDraft,
        resumeDraftFromData,
        checkExistingDraft,
        loadDraftForProject,
        resetDraftState,
    } = useWizard(orgId, user?.id, refetchCampaigns);

    // ─── Memoized value ───────────────────────────────────────────────────────────
    const value = useMemo(() => ({
        // Projects
        projects,
        projectsLoading,
        selectedProjectId,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,

        // Campaigns
        campaigns,
        campaignsLoading,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        getCampaignById,
        getCampaignsByProject,
        applyAIAction,

        // Social Posts
        socialPosts,
        socialPostsLoading,
        addSocialPost,
        updateSocialPost,
        deleteSocialPost,

        // Compare Panel
        compareMode,
        compareConfig,
        toggleCompareMode,
        setCompareConfig,
        resetCompare,

        // Credits
        // ↳ Removed — use useSubscription().credits and useSubscription().addCredits instead

        // Draft state machine
        activeDraft,
        isSaving,
        lastSaved,
        startNewDraft,
        updateDraftStep,
        debouncedUpdateDraftData,
        setDraftStepIndex,
        canAccessStep,
        launchCampaign,
        cancelDraft,
        resumeDraft,
        resumeDraftFromData,
        checkExistingDraft,
        loadDraftForProject,
        resetDraftState,
    }), [
        projects, projectsLoading, selectedProjectId,
        campaigns, campaignsLoading,
        socialPosts, socialPostsLoading,
        compareMode, compareConfig,
        activeDraft,
    ]);

    return (
        <MarketingContext.Provider value={value}>
            {children}
        </MarketingContext.Provider>
    );
};

export const useMarketing = () => {
    const context = useContext(MarketingContext);
    if (!context) {
        throw new Error('useMarketing must be used within a MarketingProvider');
    }
    return context;
};

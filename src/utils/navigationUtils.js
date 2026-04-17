/**
 * Navigation utilities for the SalesPal app.
 * Provides safe navigation helpers that prevent routes containing "undefined" or "null",
 * and centralized module-based routing logic.
 */

/**
 * Module priority order (highest first).
 * Maps internal subscription keys → route paths.
 */
const MODULE_PRIORITY = [
    { key: 'salespal360', route: '/marketing' },
    { key: 'marketing',   route: '/marketing' },
    { key: 'sales',       route: '/sales' },
    { key: 'postSale',    route: '/post-sales' },
    { key: 'support',     route: '/support' },
];

/**
 * Returns the dashboard route for the highest-priority active module.
 *
 * @param {Object} subscriptions - The subscriptions map from SubscriptionContext
 *        (keyed by module id, each value must have an `active` boolean).
 * @returns {string} The route path to navigate to, e.g. '/sales'.
 *
 * @example
 *   getDefaultModuleRoute({ sales: { active: true } })  // → '/sales'
 *   getDefaultModuleRoute({ salespal360: { active: true }, marketing: { active: true } })  // → '/marketing'
 *   getDefaultModuleRoute({})  // → '/marketing' (fallback)
 */
export const getDefaultModuleRoute = (subscriptions = {}) => {
    for (const { key, route } of MODULE_PRIORITY) {
        if (subscriptions[key]?.active) {
            return route;
        }
    }
    return '/marketing'; // fallback when no active subscriptions
};

/**
 * Returns the dashboard route for a specific module key.
 *
 * @param {string} moduleKey - The module identifier (e.g. 'sales', 'postSale').
 * @returns {string} The route path, e.g. '/sales'. Falls back to '/marketing'.
 */
export const getModuleRoute = (moduleKey) => {
    const entry = MODULE_PRIORITY.find(m => m.key === moduleKey);
    return entry?.route ?? '/marketing';
};

/**
 * Returns the correct route for navigating back to projects.
 * @param {string | undefined | null} projectId - The current project ID, if any.
 * @returns {string} The safe navigation path.
 */
export const getProjectsBackRoute = (projectId) => {
    if (typeof projectId === 'string' && projectId.length > 0 && projectId !== 'undefined' && projectId !== 'null') {
        return `/marketing/projects/${projectId}`;
    }
    return '/marketing/projects';
};

/**
 * Returns the correct route for navigating to a campaign.
 * @param {string | undefined | null} projectId - The current project ID, if any.
 * @param {string} campaignId - The campaign ID.
 * @returns {string} The safe navigation path.
 */
export const getCampaignRoute = (projectId, campaignId) => {
    if (typeof projectId === 'string' && projectId.length > 0 && projectId !== 'undefined' && projectId !== 'null') {
        return `/marketing/projects/${projectId}/campaigns/${campaignId}`;
    }
    return `/marketing/campaigns/${campaignId}`;
};

/**
 * Returns the correct route for navigating to create a new campaign.
 * @param {string | undefined | null} projectId - The current project ID, if any.
 * @returns {string} The safe navigation path.
 */
export const getNewCampaignRoute = (projectId) => {
    if (typeof projectId === 'string' && projectId.length > 0 && projectId !== 'undefined' && projectId !== 'null') {
        return `/marketing/projects/${projectId}/campaigns/new`;
    }
    // Campaigns must belong to a project, so fallback to projects hub if missing.
    return '/marketing/projects';
};

/**
 * Returns the correct route for navigating to edit a campaign.
 * @param {string | undefined | null} projectId - The current project ID, if any.
 * @param {string} campaignId - The campaign ID.
 * @returns {string} The safe navigation path.
 */
export const getCampaignEditRoute = (projectId, campaignId) => {
    if (typeof projectId === 'string' && projectId.length > 0 && projectId !== 'undefined' && projectId !== 'null') {
        return `/marketing/projects/${projectId}/campaigns/${campaignId}/edit`;
    }
    // Fallback: No edit route without project, return campaign details
    return `/marketing/campaigns/${campaignId}`;
};

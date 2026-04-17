/**
 * Campaign Launch Guard
 * 
 * This function is the ONLY authority on whether a campaign can be launched.
 * It validates that all required integrations are connected before allowing launch.
 * 
 * @param {Object} campaign - The campaign object with platforms array
 * @param {Object} integrationState - The integration state object from IntegrationContext
 * @returns {{ allowed: boolean, missing: string[] }}
 */
export function canLaunchCampaign(campaign, integrationState) {
    const missing = [];
    const platforms = campaign?.platforms || [];

    // Meta Ads required for 'meta', 'facebook', or 'instagram' platforms
    if (
        platforms.includes('meta') ||
        platforms.includes('facebook') ||
        platforms.includes('instagram')
    ) {
        if (!integrationState?.meta?.connected) {
            missing.push('Meta Ads');
        }
    }

    // Google Ads required for 'google' platform
    if (platforms.includes('google')) {
        if (!integrationState?.google?.connected) {
            missing.push('Google Ads');
        }
    }

    // LinkedIn Ads required for 'linkedin' platform
    if (platforms.includes('linkedin')) {
        if (!integrationState?.linkedin?.connected) {
            missing.push('LinkedIn Ads');
        }
    }

    return {
        allowed: missing.length === 0,
        missing
    };
}

/**
 * Get detailed integration errors for UI display
 * 
 * @param {Object} campaign - The campaign object with platforms array
 * @param {Object} integrationState - The integration state object from IntegrationContext
 * @returns {{ id: string, name: string, message: string }[]}
 */
export function getIntegrationErrors(campaign, integrationState) {
    const errors = [];
    const platforms = campaign?.platforms || [];

    if (
        platforms.includes('meta') ||
        platforms.includes('facebook') ||
        platforms.includes('instagram')
    ) {
        if (!integrationState?.meta?.connected) {
            errors.push({
                id: 'meta',
                name: 'Meta Ads',
                message: 'Meta Ads integration required for Facebook/Instagram campaigns'
            });
        }
    }

    if (platforms.includes('google')) {
        if (!integrationState?.google?.connected) {
            errors.push({
                id: 'google',
                name: 'Google Ads',
                message: 'Google Ads integration required for Google campaigns'
            });
        }
    }

    if (platforms.includes('linkedin')) {
        if (!integrationState?.linkedin?.connected) {
            errors.push({
                id: 'linkedin',
                name: 'LinkedIn Ads',
                message: 'LinkedIn Ads integration required for LinkedIn campaigns'
            });
        }
    }

    return errors;
}

export default canLaunchCampaign;

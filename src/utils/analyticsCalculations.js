/**
 * Pure Analytics Calculations
 * ---------------------------
 * This file contains strictly pure functions for calculating marketing metrics.
 * 
 * RULES:
 * 1. Input: Raw numbers or campaign objects with raw number fields.
 * 2. Output: Raw numbers (decimals allowed).
 * 3. NO formatting (no currency symbols, no % signs).
 * 4. NO side effects.
 * 5. Safe division (returns 0 instead of NaN/Infinity).
 */

/**
 * Calculates Click-Through Rate (CTR)
 * Formula: (Clicks / Impressions) * 100
 * @param {number} clicks 
 * @param {number} impressions 
 * @returns {number} CTR as percentage number (e.g. 5.2 for 5.2%)
 */
export const calculateCTR = (clicks, impressions) => {
    if (!impressions || impressions <= 0) return 0;
    return (clicks / impressions) * 100;
};

/**
 * Calculates Cost Per Click (CPC)
 * Formula: Spend / Clicks
 * @param {number} spend 
 * @param {number} clicks 
 * @returns {number} Cost per click
 */
export const calculateCPC = (spend, clicks) => {
    if (!clicks || clicks <= 0) return 0;
    return spend / clicks;
};

/**
 * Calculates Cost Per Mille (CPM) - Cost per 1,000 impressions
 * Formula: (Spend / Impressions) * 1000
 * @param {number} spend 
 * @param {number} impressions 
 * @returns {number} CPM
 */
export const calculateCPM = (spend, impressions) => {
    if (!impressions || impressions <= 0) return 0;
    return (spend / impressions) * 1000;
};

/**
 * Calculates Return on Ad Spend (ROAS)
 * Formula: Revenue / Spend
 * @param {number} revenue 
 * @param {number} spend 
 * @returns {number} ROAS multiplier (e.g. 3.5 for 3.5x)
 */
export const calculateROAS = (revenue, spend) => {
    if (!spend || spend <= 0) return 0;
    return revenue / spend;
};

/**
 * Calculates Cost Per Lead (CPL) or Cost Per Result (CPA)
 * Formula: Spend / Conversions
 * @param {number} spend 
 * @param {number} conversions 
 * @returns {number} Cost per conversion
 */
export const calculateCPL = (spend, conversions) => {
    if (!conversions || conversions <= 0) return 0;
    return spend / conversions;
};

/**
 * Calculates Frequency
 * Formula: Impressions / Reach
 * description: Average number of times a unique user saw the ad.
 * @param {number} impressions 
 * @param {number} reach 
 * @returns {number} Frequency
 */
export const calculateFrequency = (impressions, reach) => {
    if (!reach || reach <= 0) return 0;
    return impressions / reach;
};

/**
 * Calculates Landing Page Conversion Rate
 * Formula: (Conversions / Link Clicks) * 100
 * Note: Uses Link Clicks specifically if available, otherwise generic clicks with lower accuracy guidance.
 * @param {number} conversions 
 * @param {number} linkClicks 
 * @returns {number} Conversion Rate percentage
 */
export const calculateLandingPageCVR = (conversions, linkClicks) => {
    if (!linkClicks || linkClicks <= 0) return 0;
    return (conversions / linkClicks) * 100;
};

// distribute() removed — all dashboard analytics now use real Supabase data.

/**
 * Calculates Percentage Change between current and previous values
 * @param {number} current 
 * @param {number} previous 
 * @returns {number} Percentage change (e.g. 25.5 for 25.5%)
 */
export const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

/**
 * Generate insight from current-period data only (no comparison).
 * Evaluates ROAS and CPA against meaningful thresholds.
 */
export const generateCurrentInsight = (currentTotals) => {
    if (!currentTotals) {
        return {
            insight: "Waiting for campaign data to generate insights.",
            recommendation: "Connect your ad platforms to start tracking performance.",
            type: "neutral"
        };
    }

    const roas = Number(currentTotals.roas) || 0;
    const cpa = Number(currentTotals.cpa) || 0;

    // Strong ROAS + low CPA → healthy
    if (roas >= 2.5 && cpa <= 200) {
        return {
            insight: "Campaign performance is strong — healthy returns with controlled acquisition costs.",
            recommendation: "Maintain your current strategy. Consider testing incremental budget increases.",
            type: "positive"
        };
    }

    // Good ROAS but CPA is creeping up
    if (roas >= 2.0 && cpa > 200) {
        return {
            insight: "Campaigns are generating returns, but acquisition costs are above optimal levels.",
            recommendation: "Review audience segments and bid strategies to lower CPA without sacrificing ROAS.",
            type: "warning"
        };
    }

    // Weak ROAS regardless of CPA
    if (roas < 1.5) {
        return {
            insight: "Campaign performance is below optimal levels — ad spend is not converting efficiently.",
            recommendation: "Prioritize creative refresh, tighten audience targeting, and pause underperforming ad sets.",
            type: "negative"
        };
    }

    // Moderate ROAS with high CPA
    if (roas < 2.0 && cpa > 300) {
        return {
            insight: "Acquisition costs are elevated while returns remain moderate.",
            recommendation: "Focus on reducing CPA through retargeting, lookalike audiences, or channel reallocation.",
            type: "warning"
        };
    }

    // Moderate performance — neither great nor bad
    return {
        insight: "Campaign performance is steady with room for optimization.",
        recommendation: "A/B test creatives and landing pages to identify efficiency gains.",
        type: "neutral"
    };
};

/**
 * Generate comparative insight between current and previous period totals.
 */
export const generateInsights = (currentTotals, previousTotals) => {
    if (!currentTotals || !previousTotals) {
        return {
            insight: "Performance remained stable.",
            recommendation: "Maintain current strategy.",
            type: "neutral"
        };
    }

    const currRoas = Number(currentTotals.roas) || 0;
    const currCpa = Number(currentTotals.cpa) || 0;
    const prevRoas = Number(previousTotals.roas) || 0;
    const prevCpa = Number(previousTotals.cpa) || 0;

    if (prevRoas === 0 || prevCpa === 0) {
        return {
            insight: "Missing baseline data in previous period.",
            recommendation: "Ensure the selected previous date range has recorded activity.",
            type: "neutral"
        };
    }

    const roasChange = ((currRoas - prevRoas) / prevRoas) * 100;
    const cpaChange = ((currCpa - prevCpa) / prevCpa) * 100;

    const roasUp = roasChange > 2;
    const roasDown = roasChange < -2;
    const cpaUp = cpaChange > 2;
    const cpaDown = cpaChange < -2;

    if (roasUp && cpaDown) {
        return {
            insight: "Campaign efficiency improved significantly.",
            recommendation: "Consider scaling budget.",
            type: "positive"
        };
    } else if (roasDown && cpaUp) {
        return {
            insight: "Performance declined while costs increased.",
            recommendation: "Review targeting and creatives.",
            type: "negative"
        };
    } else if (roasUp && cpaUp) {
        return {
            insight: "Revenue increased but efficiency dropped.",
            recommendation: "Optimize cost per acquisition.",
            type: "warning" 
        };
    } else if (roasDown && cpaDown) {
        return {
            insight: "Costs improved but revenue generation slowed down.",
            recommendation: "Ensure budgets aren't choked. Test new creatives.",
            type: "warning"
        };
    }

    // Minimal change within the threshold bounds
    return {
        insight: "Performance remained stable.",
        recommendation: "Maintain current strategy.",
        type: "neutral"
    };
};

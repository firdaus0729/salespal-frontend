/**
 * Development-only utility to generate realistic mock analytics data.
 * Utility to generate time-series analytics data for comparison features.
 * 
 * Rules:
 * - Pure function, no side effects
 * - No React dependencies
 */

/**
 * Generates an array of daily performance metrics between two dates.
 * 
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {Array} Array of daily data objects
 */
export const generateTimeSeriesData = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normalize to start of day for accurate loop checking
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const data = [];
    const currentDate = new Date(start);

    // Helper for random number between min and max
    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    while (currentDate <= end) {
        // Generate realistic base metrics with slight daily randomness
        const impressions = Math.floor(randomBetween(1000, 5000));
        
        // Clicks: 2% - 10% of impressions
        const clickRate = randomBetween(0.02, 0.10);
        const clicks = Math.floor(impressions * clickRate);
        
        // Conversions: 2% - 8% of clicks
        const convRate = randomBetween(0.02, 0.08);
        const conversions = Math.floor(clicks * convRate);
        
        // Spend: ₹500 - ₹5000
        const spend = Number(randomBetween(500, 5000).toFixed(2));
        
        // Revenue: 1.5x - 3x of spend
        const roas = randomBetween(1.5, 3.0);
        const revenue = Number((spend * roas).toFixed(2));

        data.push({
            date: currentDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
            impressions,
            clicks,
            conversions,
            spend,
            revenue
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
};

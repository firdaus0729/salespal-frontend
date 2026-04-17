/**
 * Utility functions for date comparisons.
 * Used primarily for performance comparison panels.
 */

export const getPreviousPeriodRange = (currentRange, customStart = null, customEnd = null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    const endDate = new Date(today);

    // Default to end of day for the end bound
    endDate.setHours(23, 59, 59, 999);

    switch (currentRange) {
        case 'today':
            // Previous period for today is yesterday
            startDate.setDate(today.getDate() - 1);
            endDate.setDate(today.getDate() - 1);
            break;

        case '7d':
            // Current is last 7 days (today-6 to today)
            // Previous is today-13 to today-7
            startDate.setDate(today.getDate() - 13);
            endDate.setDate(today.getDate() - 7);
            break;

        case '1m':
        case '30d':
            // Current is last 30 days (today-29 to today)
            // Previous is today-59 to today-30
            startDate.setDate(today.getDate() - 59);
            endDate.setDate(today.getDate() - 30);
            break;

        case 'custom':
            if (customStart && customEnd) {
                const s = new Date(customStart);
                const e = new Date(customEnd);
                
                // Calculate difference in milliseconds, convert to days
                const diffTime = Math.abs(e - s);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // End date is 1 day before the custom start
                endDate.setTime(s.getTime() - (1000 * 60 * 60 * 24));
                endDate.setHours(23, 59, 59, 999);

                // Start date is diffDays before the new end date
                startDate.setTime(endDate.getTime() - (diffDays * 1000 * 60 * 60 * 24));
                startDate.setHours(0, 0, 0, 0);
            }
            break;

        default:
            return null;
    }

    return { startDate, endDate };
};

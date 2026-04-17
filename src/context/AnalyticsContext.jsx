import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Core State
    const [timeRange, setTimeRange] = useState('7d'); // 'today', '7d', '1m', 'custom'
    const [channelFilter, setChannelFilter] = useState('all'); // 'all', 'meta', 'google', 'linkedin'
    const [compareMode, setCompareMode] = useState(false);

    // Custom date range state
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    const setCustomDateRange = (start, end) => {
        setCustomStartDate(start);
        setCustomEndDate(end);
        setTimeRange('custom');
    };

    // Sync Project ID from URL
    const selectedProjectId = searchParams.get('projectId') || 'all';

    const setProject = (projectId) => {
        if (projectId === 'all') {
            searchParams.delete('projectId');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ ...Object.fromEntries(searchParams), projectId });
        }
    };

    const value = useMemo(() => ({
        timeRange,
        setTimeRange,
        channelFilter,
        setChannelFilter,
        compareMode,
        setCompareMode,
        selectedProjectId,
        setProject,
        isGlobal: selectedProjectId === 'all',
        customStartDate,
        customEndDate,
        setCustomDateRange,
    }), [timeRange, channelFilter, compareMode, selectedProjectId, customStartDate, customEndDate]);

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};

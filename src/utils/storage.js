/**
 * storage.js — DEPRECATED
 *
 * This file previously stored campaigns and projects in localStorage.
 * It has been replaced by Supabase-backed calls in MarketingContext.jsx.
 *
 * Kept as a no-op stub to avoid breaking any residual imports
 * during the transition. Safe to delete once all imports are cleaned up.
 */

export const getCampaigns = () => [];
export const saveCampaigns = () => { };
export const clearCampaigns = () => { };
export const addCampaign = (c) => c;
export const updateCampaign = (id, updates) => updates;

export const getProjects = () => [];
export const saveProjects = () => { };
export const addProject = (p) => p;

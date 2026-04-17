import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useOrg } from '../context/OrgContext';

/**
 * useProjects — Supabase-backed projects CRUD hook
 * Replaces localStorage project persistence from ProjectContext + MarketingContext
 */
export function useProjects() {
    const { orgId } = useOrg();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        if (!orgId) {
            setProjects([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await api.get('/projects?status=active');
            setProjects(data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const createProject = async (projectData) => {
        if (!orgId) return { data: null, error: 'No organization' };

        try {
            const data = await api.post('/projects', { name: projectData.name });
            setProjects(prev => [data, ...prev]);
            return { data, error: null };
        } catch (err) {
            console.error('Error creating project:', err);
            return { data: null, error: err.message };
        }
    };

    const updateProject = async (projectId, updates) => {
        try {
            const data = await api.put(`/projects/${projectId}`, updates);
            setProjects(prev => prev.map(p => p.id === projectId ? data : p));
            return { data, error: null };
        } catch (err) {
            console.error('Error updating project:', err);
            return { data: null, error: err.message };
        }
    };

    const archiveProject = async (projectId) => {
        try {
            await api.post(`/projects/${projectId}/archive`);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            return { error: null };
        } catch (err) {
            console.error('Error archiving project:', err);
            return { error: err.message };
        }
    };

    const getProjectById = (id) => {
        return projects.find(p => p.id === id) || null;
    };

    return {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        archiveProject,
        getProjectById,
        refetch: fetchProjects
    };
}

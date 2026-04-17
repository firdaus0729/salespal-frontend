import React, { createContext, useContext, useState, useMemo } from 'react';
import { useMarketing } from './MarketingContext';

/**
 * ProjectContext — Thin selector over MarketingContext projects.
 * MarketingContext already delegates to useProjects() internally,
 * so this avoids a second Supabase fetch for the same data.
 * Maintains the same useProject() API for backward compatibility
 * with ProjectsHub, Sidebar, ProjectLayout, etc.
 */
const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const {
        projects,
        projectsLoading: loading,
        createProject,
        deleteProject: archiveProject,
        getProjectById,
    } = useMarketing();
    const [activeProject, setActiveProject] = useState(null);

    const addProject = async (projectData) => {
        return await createProject(projectData);
    };

    const selectProject = (project) => {
        setActiveProject(project);
    };

    const clearActiveProject = () => {
        setActiveProject(null);
    };

    const value = useMemo(() => ({
        activeProject,
        projects,
        selectProject,
        addProject,
        clearActiveProject,
        getProjectById,
        archiveProject,
        loading,
    }), [activeProject, projects, loading, getProjectById, archiveProject]);

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

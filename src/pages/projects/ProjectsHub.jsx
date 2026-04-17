import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import SectionWrapper from '../../components/layout/SectionWrapper';
import ProjectCard from './ProjectCard';
import CreateProjectFlow from './CreateProjectFlow';
import { Plus, Boxes } from 'lucide-react';
import Button from '../../components/ui/Button'; // Assuming Button component availability

const ProjectsHub = () => {
    const { projects, selectProject, loading } = useProject();
    const { isAuthenticated } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    // Guard handled by router usually, but safety check
    if (!loading && !isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleProjectClick = (project) => {
        selectProject(project);
        navigate('/console/dashboard');
    };

    return (
        <div className="min-h-screen bg-primary">
            <Navbar />

            <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                        <p className="text-gray-400">Manage your SalesPal implementations.</p>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Project
                        </button>
                    )}
                </div>

                {/* Content */}
                {isCreating ? (
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <CreateProjectFlow onClose={() => setIsCreating(false)} />
                    </div>
                ) : (
                    <>
                        {projects.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                                    <Boxes className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No projects found for this account</h3>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">Get started by creating your first AI project to access the SalesPal console.</p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create New Project
                                </button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(project => (
                                    <ProjectCard
                                        key={project.id || Math.random()}
                                        project={project}
                                        onClick={() => handleProjectClick(project)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectsHub;

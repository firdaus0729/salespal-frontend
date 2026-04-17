import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, Check, Plus, Folder } from 'lucide-react';
import { useMarketing } from '../context/MarketingContext';

const ProjectSwitcher = () => {
    const navigate = useNavigate();
    const { projects, selectedProjectId, selectProject } = useMarketing();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (project) => {
        selectProject(project.id);
        navigate(`/marketing/projects/${project.id}`);
        setIsOpen(false);
    };

    const handleAllProjects = () => {
        selectProject(null); // Clear selection to show All Projects Overview
        navigate('/marketing');
        setIsOpen(false);
    };

    const handleCreate = () => {
        navigate('/marketing/projects/new');
        setIsOpen(false);
    };

    return (
        <div className="relative text-left" ref={dropdownRef}>
            <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-50 rounded text-blue-600">
                        <Folder className="w-4 h-4" />
                    </div>
                    <span className="max-w-[150px] truncate">
                        {selectedProject ? selectedProject.name : 'All Projects'}
                    </span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-down origin-top-left">
                    {/* All Projects Option */}
                    <button
                        onClick={handleAllProjects}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                        <span>All Projects</span>
                        {!selectedProjectId && (
                            <Check className="w-4 h-4 text-blue-600" />
                        )}
                    </button>

                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Projects
                    </div>

                    <div className="max-h-[240px] overflow-y-auto">
                        {projects.length > 0 ? (
                            projects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => handleSelect(project)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="truncate">{project.name}</span>
                                    {selectedProjectId === project.id && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-400 italic">
                                No projects found
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                        <button
                            onClick={handleCreate}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Project
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSwitcher;

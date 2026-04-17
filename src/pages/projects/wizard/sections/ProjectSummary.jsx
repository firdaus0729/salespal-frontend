import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const ProjectSummary = ({ projectName, industry, selectedModules }) => {
    return (
        <Card className="p-6 bg-white/5 border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">Project Summary</h2>

            <div className="space-y-4">
                <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Project Name</span>
                    <p className="text-white font-medium">{projectName || <span className="text-gray-600 italic">Not set</span>}</p>
                </div>

                <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Industry</span>
                    <p className="text-white font-medium capitalize">{industry || <span className="text-gray-600 italic">Not selected</span>}</p>
                </div>

                <div>
                    <span className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Selected Modules</span>
                    <div className="flex flex-wrap gap-2">
                        {selectedModules.length > 0 ? (
                            selectedModules.map(mod => (
                                <Badge key={mod} variant="secondary" className="capitalize">
                                    {mod}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-gray-600 italic text-sm">None selected</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProjectSummary;

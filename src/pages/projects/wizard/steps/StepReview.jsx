import React from 'react';
import StepHeader from '../components/StepHeader';
import Badge from '../../../../components/ui/Badge';
import { FileText, Layers } from 'lucide-react';

const StepReview = ({ projectData }) => {
    return (
        <div className="max-w-xl">
            <StepHeader
                title="Review & Confirm"
                description="Double check your project details before creation."
            />

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Project Name</span>
                        <p className="text-white font-medium text-lg">{projectData.name}</p>
                        <p className="text-gray-400 text-sm capitalize">{projectData.industry}</p>
                    </div>
                </div>

                <div className="h-px bg-white/10"></div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Selected Modules</span>
                        <div className="flex flex-wrap gap-2">
                            {projectData.modules.map(mod => (
                                <Badge key={mod} variant="secondary" className="capitalize">
                                    {mod}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StepReview;

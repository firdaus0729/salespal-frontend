import React, { useState } from 'react';
import StepIndicator from './wizard/components/StepIndicator';
import StepProjectInfo from './wizard/steps/StepProjectInfo';
import StepModuleSelect from './wizard/steps/StepModuleSelect';
import StepReview from './wizard/steps/StepReview';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const CreateProjectFlow = ({ onClose }) => {
    const { addProject, selectProject } = useProject();
    const [currentStep, setCurrentStep] = useState(1);
    const [projectData, setProjectData] = useState({
        name: '',
        industry: '',
        modules: []
    });

    const steps = [
        { label: 'Project Info' },
        { label: 'Select Modules' },
        { label: 'Review' }
    ];

    const updateData = (key, value) => {
        setProjectData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!projectData.name.trim() || !projectData.industry) {
                alert('Please complete all fields.');
                return;
            }
        }
        if (currentStep === 2) {
            if (projectData.modules.length === 0) {
                alert('Please select at least one module.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = () => {
        // Add to project list
        addProject(projectData);
        // Behave as if selected (optional, or just close)
        // selectProject(newProject) <-- user asked to just close and show in list
        onClose();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepProjectInfo projectData={projectData} updateData={updateData} />;
            case 2:
                return <StepModuleSelect projectData={projectData} updateData={updateData} />;
            case 3:
                return <StepReview projectData={projectData} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
            >
                <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-8">Create New Project</h2>

            <StepIndicator currentStep={currentStep} steps={steps} />

            <div className="min-h-[300px] mb-8 animate-fade-in">
                {renderStep()}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-white/10">
                <button
                    onClick={handleBack}
                    className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5 
                  ${currentStep === 1 ? 'invisible' : 'visible'}
                `}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex bg-transparent">
                    <button
                        onClick={currentStep === 3 ? handleSubmit : handleNext}
                        className="bg-secondary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-all flex items-center gap-2"
                    >
                        {currentStep === 3 ? 'Create Project' : 'Continue'}
                        {currentStep === 3 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectFlow;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import Navbar from '../../../components/layout/Navbar';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import StepIndicator from './components/StepIndicator';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Steps
import StepProjectInfo from './steps/StepProjectInfo';
import StepModuleSelect from './steps/StepModuleSelect';
import StepReview from './steps/StepReview';

const CreateProject = () => {
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
        // Validation
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
        console.log('Final Project Payload:', projectData);
        alert('Project Ready! Check console for payload.');
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
        <div className="min-h-screen bg-primary text-white">
            <Navbar />

            <div className="pt-32 pb-20">
                <SectionWrapper>

                    <StepIndicator currentStep={currentStep} steps={steps} />

                    <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 min-h-[400px] flex flex-col justify-between">

                        {/* Step Content */}
                        <div className="mb-8 animate-fade-in">
                            {renderStep()}
                        </div>

                        {/* Actions */}
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

                            <button
                                onClick={currentStep === 3 ? handleSubmit : handleNext}
                                className="bg-secondary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-all flex items-center gap-2"
                            >
                                {currentStep === 3 ? 'Create Project' : 'Continue'}
                                {currentStep === 3 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>

                    </div>
                </SectionWrapper>
            </div>
        </div>
    );
};

export default CreateProject;

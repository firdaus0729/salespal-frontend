import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stepper from './components/Stepper';
import Step1Contact from './components/Step1Contact';
import Step2Plan from './components/Step2Plan';
import Step3Property from './components/Step3Property';
import Step4Script from './components/Step4Script';
import Step5Review from './components/Step5Review';
import DemoCallScreen from './components/DemoCallScreen';
import DynamicPanel from './components/DynamicPanel';

const DemoPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isCalling, setIsCalling] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        plan: '',
        propertyName: '',
        location: '',
        price: '',
        description: '',
        website: '',
        scriptOption: 'ai',
        scriptContent: '',
        brochureFile: null,
        scriptFile: null,
    });

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsCalling(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const updateFormData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    if (isCalling) {
        return <DemoCallScreen formData={formData} onEndCall={() => setIsCalling(false)} />;
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <Step1Contact formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
            case 1:
                return <Step2Plan formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
            case 2:
                return <Step3Property formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <Step4Script formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
            case 4:
                return <Step5Review formData={formData} onNext={handleNext} onBack={handleBack} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Experience Your AI Sales Agent Live</h1>
                    <p className="text-xl text-gray-600">Give one property detail — AI will handle the rest.</p>
                </div>

                <div className="grid lg:grid-cols-[1.6fr_1.2fr] gap-6 items-start">
                    {/* Left Side: Main Stepper Flow */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full min-h-[500px]">
                        <div className="px-8 pt-8 pb-4 bg-gray-50/50 border-b border-gray-100">
                            <Stepper currentStep={currentStep} />
                        </div>

                        <div className="p-8 grow flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {renderStep()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side: Dynamic Context Panel */}
                    <div className="h-full sticky top-24">
                        <DynamicPanel currentStep={currentStep} formData={formData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;

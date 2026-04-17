import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { X, ChevronRight, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useMarketing } from '../../../context/MarketingContext';
import { getProjectsBackRoute } from '../../../utils/navigationUtils';
import api from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Components
import StepHeader from './components/StepHeader';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import Button from '../../../components/ui/Button';

// Steps
import StepBusinessInput from './steps/StepBusinessInput';
import StepAIAnalysis from './steps/StepAIAnalysis';
import StepAdCreation from './steps/StepAdCreation';
import StepPlatformBudget from './steps/StepPlatformBudget';
import StepReviewLaunch from './steps/StepReviewLaunch';

const STEPS = [
    {
        label: 'Business',
        title: 'Tell SalesPal AI About Your Business',
        subtitle: (
            <>
                Share your business details via text, website, or PDF. Include your location for automatic currency detection.
                <span className="inline-flex items-start gap-2 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-sm font-semibold text-blue-700 leading-snug">
                        Adding more information about your product will make your ads more accurate.
                    </span>
                </span>
            </>
        )
    },
    {
        label: 'Analysis', title: 'AI Business Brief', subtitle: "AI-generated summary of your business. You can review and edit before proceeding."
    },
    { label: 'Campaigns', title: 'Ad Campaign Builder', subtitle: 'Select AI-recommended campaigns and target platforms for your ads.' },
    { label: 'Budget', title: 'Budget & Spend', subtitle: 'Review and adjust how much you want to spend on your campaign.' },
    { label: 'Review', title: 'Review & Launch', subtitle: 'Review your campaign details before going live.' },
];



const NewCampaign = () => {
    const { projectId } = useParams();
    const location = useLocation();
    const { showToast } = useToast();
    
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isDiscarding, setIsDiscarding] = useState(false);
    const {
        activeDraft,
        isSaving,
        lastSaved,
        startNewDraft,
        updateDraftStep,
        debouncedUpdateDraftData,
        setDraftStepIndex,
        canAccessStep,
        launchCampaign,
        checkExistingDraft,
        resumeDraftFromData,
    } = useMarketing();

    // Draft modal state
    const [hasCheckedDraft, setHasCheckedDraft] = useState(false);
    const [existingDraft, setExistingDraft] = useState(null);

    // Derived state directly from context
    const currentStep = activeDraft?.currentStepIndex || 0;
    
    // AI Analysis loading state
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const topRef = useRef(null);

    const navigate = useNavigate();

    // PART 1: Check for returning from platform connection
    useEffect(() => {
        // Check if we're returning from a successful platform connection
        const urlParams = new URLSearchParams(location.search);
        const platformConnected = urlParams.get('connected');

        if (platformConnected) {
            // Show success toast
            showToast({
                title: 'Platform Connected Successfully',
                description: 'You can now continue your campaign setup.',
                variant: 'success'
            });

            // Clean up URL
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    // Check for existing draft on mount before allowing access
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (activeDraft && activeDraft.projectId === projectId) {
                // We already have a valid active draft for this project
                setHasCheckedDraft(true);
                return;
            }

            const draftRow = await checkExistingDraft(projectId);
            if (!mounted) return;

            if (draftRow) {
                setExistingDraft(draftRow); // Opens the modal
            } else {
                await startNewDraft(projectId);
                if (mounted) setHasCheckedDraft(true);
            }
        };

        if (!hasCheckedDraft && !existingDraft) {
            init();
        }

        return () => { mounted = false; };
    }, [projectId, checkExistingDraft, startNewDraft, hasCheckedDraft, existingDraft, activeDraft]);

    // Guard: Prevent deep linking to locked steps
    React.useEffect(() => {
        if (activeDraft && !canAccessStep(currentStep)) {
            // Find highest accessible step? For now just go to 0 or previous
            // Simple logic: if restricted, go to 0
            if (currentStep > 0) {
                // Try to go back until we find an accessible step
                let safeStep = currentStep - 1;
                while (safeStep >= 0 && !canAccessStep(safeStep)) {
                    safeStep--;
                }
                setDraftStepIndex(Math.max(0, safeStep));
            }
        }
    }, [currentStep, activeDraft]);

    // Handle scrolling to top on step change
    useEffect(() => {
        if (topRef.current) {
            // Small timeout allows framer-motion to swap nodes before calculating bounds
            setTimeout(() => {
                topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }, [currentStep]);

    if (!hasCheckedDraft) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                {existingDraft ? (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">You have an unfinished campaign</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                You previously started creating a campaign in this project. Would you like to resume it or start a new one?
                            </p>

                            <div className="mb-6 bg-gray-50 rounded-lg p-3 text-xs border border-gray-100">
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-gray-500 font-medium">Last edited:</span>
                                    <span className="text-gray-900 font-medium">{timeAgo(existingDraft.updated_at)}</span>
                                </div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-gray-500 font-medium">Stopped at:</span>
                                    <span className="text-gray-900 font-medium">Step {existingDraft.wizard_step + 1} - {STEPS[existingDraft.wizard_step]?.label || ''}</span>
                                </div>
                                {existingDraft.draft_data?.data?.name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 font-medium">Campaign:</span>
                                        <span className="text-gray-900 font-medium truncate max-w-[150px]">{existingDraft.draft_data.data.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full text-sm py-2.5" onClick={() => {
                                    resumeDraftFromData(existingDraft);
                                    setHasCheckedDraft(true);
                                }}>
                                    Resume Campaign
                                </Button>
                                <Button variant="outline" className="w-full text-sm py-2.5 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors" onClick={() => setIsDiscardModalOpen(true)}>
                                    Start New Campaign
                                </Button>
                                {isDiscardModalOpen && (
                                    <ConfirmationModal
                                        isOpen={isDiscardModalOpen}
                                        onClose={() => setIsDiscardModalOpen(false)}
                                        onConfirm={async () => {
                                            try {
                                                setIsDiscarding(true);
                                                await api.delete(`/marketing/drafts/${existingDraft.id}`);
                                                await startNewDraft(projectId);
                                                setHasCheckedDraft(true);
                                            } catch (err) {
                                                showToast({
                                                    title: 'Error',
                                                    description: 'Failed to discard draft.',
                                                    variant: 'error'
                                                });
                                            } finally {
                                                setIsDiscarding(false);
                                                setIsDiscardModalOpen(false);
                                            }
                                        }}
                                        title="Discard Previous Draft?"
                                        message="Starting a new campaign will permanently discard your previous draft. Are you sure?"
                                        confirmText="Discard & Start New"
                                        variant="danger"
                                        isLoading={isDiscarding}
                                    />
                                )}
                                <Button variant="ghost" className="w-full text-sm py-2.5" onClick={() => {
                                    navigate(-1);
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-gray-500 font-medium">Preparing campaign wizard...</p>
                    </div>
                )}
            </div>
        );
    }

    if (!activeDraft) return null; // Fallback or loading spinner

    const handleBack = () => {
        if (currentStep > 0) {
            setDraftStepIndex(currentStep - 1);
        }
    };

    const handleExit = () => {
        navigate(getProjectsBackRoute(projectId), { replace: true });
    };

    // Inject handleNext/save logic into steps
    const onStepComplete = async (stepKey, data) => {
        console.log('[onStepComplete] stepKey:', stepKey, 'data keys:', Object.keys(data || {}));
        if (stepKey === 'business') {
            try {
                // Instantly Transition UX State
                setIsAnalyzing(true);
                
                const formData = new FormData();
                if (data.description) formData.append('description', data.description);
                if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
                if (data.logoFile) formData.append('logo', data.logoFile);
                if (data.pdfFile) formData.append('pdf', data.pdfFile);

                const safeData = { ...data };
                delete safeData.logoFile;
                delete safeData.pdfFile;
                await updateDraftStep('business', safeData);

                // Move Wizard Step to show Loading Skeleton immediately
                await setDraftStepIndex(1);

                api.post('/api/marketing/ai-analyze', formData)
                    .then(async (response) => {
                        console.log('[NewCampaign] Raw API response:', response);
                        console.log('[NewCampaign] response.data keys:', Object.keys(response?.data || {}));
                        // Response is { success: true, data: { ... } }
                        const aiData = response.data || response;
                        console.log('[NewCampaign] aiData keys:', Object.keys(aiData || {}));
                        console.log('[NewCampaign] aiData.businessSummary:', aiData.businessSummary?.substring(0, 80));
                        await updateDraftStep('analysis', { analysisData: aiData });
                        setIsAnalyzing(false);
                    })
                    .catch(async (error) => {
                        console.error('[NewCampaign] AI Analysis Error:', error);
                        console.error('[NewCampaign] Error details:', error?.message, error?.status);
                        await updateDraftStep('analysis', { analysisData: { 
                            error: true,
                            businessSummary: data.description || "Website analyzed successfully based on metadata.",
                            tags: ['Business', 'Online'],
                            brandPersonality: { archetype: 'Professional', traits: ['Reliable', 'Modern', 'Customer-focused'] },
                            keyDifferentiators: ['Quality offering', 'Strong positioning'],
                            brandMaturity: { stage: 'growth', explanation: 'Generic fallback strategy engaged.' },
                            products: [],
                            competitors: [],
                            growthPriorities: [{title: 'Expand Reach', description: 'Acquire new users via core channels.'}],
                            paidStrategy: { budget: 'medium', channels: ['Search', 'Social'], description: 'Balanced paid approach.' },
                            organicStrategy: { contentPillars: ['Content'], platforms: ['Social'], description: 'Build organic reach.' },
                            campaignRecommendations: [
                                { title: 'Awareness Campaign', type: 'Social', priority: 'high', description: 'Increase brand visibility.' }
                            ]
                        }});
                        setIsAnalyzing(false);
                    });

                return;
            } catch (error) {
                console.error('Save Data Error:', error);
                showToast({
                    title: 'Save Failed',
                    description: error?.message || 'Failed to save business info. Please try again.',
                    variant: 'error'
                });
                setIsAnalyzing(false);
            }
        } else {
            await updateDraftStep(stepKey, data);
            if (currentStep < STEPS.length - 1) {
                await setDraftStepIndex(currentStep + 1);
            }
        }
    };

    const renderStepContent = () => {
        const commonProps = {
            data: activeDraft.data,
            onBack: handleBack,
            onUpdate: debouncedUpdateDraftData
        };

        switch (currentStep) {
            case 0: return <StepBusinessInput onComplete={(data) => onStepComplete('business', data)} isAnalyzing={isAnalyzing} {...commonProps} />;
            case 1: return <StepAIAnalysis onComplete={(data) => onStepComplete('analysis', data)} ai={activeDraft.ai} isAnalyzing={isAnalyzing} {...commonProps} />;
            case 2: return <StepAdCreation onComplete={(data) => onStepComplete('ads', data)} {...commonProps} />;
            case 3: return <StepPlatformBudget onComplete={(data) => onStepComplete('budget', data)} {...commonProps} />;
            case 4: return <StepReviewLaunch onLaunch={async () => {
                const res = await launchCampaign();
                if (res && res.success) {
                    navigate(getProjectsBackRoute(projectId));
                }
                return res;
            }} {...commonProps} />;
            default: return null;
        }
    };

    return (
        <div ref={topRef} className="w-full max-w-[1400px] mx-auto py-3 md:py-4">
            {/* Header Row: Breadcrumbs, Stepper, Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 px-2">
                {/* Left: Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-500 w-full lg:w-auto shrink-0">
                    <Link to="/marketing" className="hover:text-gray-900 transition-colors">Marketing</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link to="/marketing/projects" className="hover:text-gray-900 transition-colors">Projects</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 truncate max-w-[120px]">New Campaign</span>
                </div>

                {/* Middle: Stepper */}
                <div className="flex-1 w-full lg:max-w-2xl px-2 lg:px-8">
                    <StepIndicator steps={STEPS} currentStep={currentStep} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 w-full lg:w-auto justify-end flex-wrap shrink-0">
                    <div className="flex items-center text-xs text-gray-400 font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-primary" />
                                Saving...
                            </>
                        ) : lastSaved ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                                All changes saved
                            </>
                        ) : (
                            <span className="px-1 text-gray-400">Draft</span>
                        )}
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExit}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Exit
                    </Button>
                </div>
            </div>

            {/* Wizard Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Step Content */}
                <div className="p-6 md:p-8">
                    <StepHeader
                        title={STEPS[currentStep].title}
                        subtitle={STEPS[currentStep].subtitle}
                    />

                    <div className="mt-8 min-h-[400px]">
                        <AnimatePresence mode="wait">
                                {renderStepContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewCampaign;

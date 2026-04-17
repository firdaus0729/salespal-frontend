import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, FileText, AlignLeft, Check, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import FileUploadBox from '../components/FileUploadBox';
import Input from '../../../../components/ui/Input';
import Textarea from '../../../../components/ui/Textarea';
import Button from '../../../../components/ui/Button';
import { useMarketing } from '../../../../context/MarketingContext';

const StepBusinessInput = ({ onComplete, onUpdate, data, isAnalyzing }) => {
    const { projectId } = useParams();
    const { getProjectById } = useMarketing();
    const [activeTab, setActiveTab] = useState('description');

    // Form Data
    const [description, setDescription] = useState(data?.description || '');
    const [websiteUrl, setWebsiteUrl] = useState(data?.websiteUrl || '');
    const [pdfFile, setPdfFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    // Logo Dropzone Logic
    const onLogoDrop = (acceptedFiles) => {
        if (acceptedFiles?.length) {
            const file = Object.assign(acceptedFiles[0], {
                preview: URL.createObjectURL(acceptedFiles[0])
            });
            setLogoFile(file);
        }
    };

    const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
        onDrop: onLogoDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 1,
        maxSize: 2097152 // 2MB
    });

    // Validation State
    const [showError, setShowError] = useState(false);

    // Autofill website from project context if draft has no website yet.
    useEffect(() => {
        if (websiteUrl || !projectId) return;
        const project = getProjectById(projectId);
        if (project?.website) setWebsiteUrl(project.website);
    }, [projectId, websiteUrl, getProjectById]);

    useEffect(() => {
        if (onUpdate) {
            onUpdate({
                description,
                websiteUrl,
                inputMode: activeTab
            });
        }
    }, [description, websiteUrl, activeTab, onUpdate]);

    // Validation
    const isTabValid = () => {
        switch (activeTab) {
            case 'description': return description.trim().length > 10;
            case 'url': {
                const processed = websiteUrl.trim();
                const urlPattern = /^(https?:\/\/)?(localhost|[\w.-]+\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/.*)?$/;
                return Boolean(processed) && urlPattern.test(processed);
            }
            case 'pdf': return Boolean(pdfFile);
            default: return false;
        }
    };

    const handleNext = async () => {
        if (isAnalyzing) return;

        if (!isTabValid()) {
            setShowError(true);
            alert("Please fill in the mandatory fields to proceed."); // "Pop up" as requested
            return;
        }

        let finalWebsiteUrl = websiteUrl.trim();
        if (activeTab === 'url' && finalWebsiteUrl) {
            if (!finalWebsiteUrl.startsWith('http://') && !finalWebsiteUrl.startsWith('https://')) {
                finalWebsiteUrl = `https://${finalWebsiteUrl}`;
            }
        }

        if (onComplete) {
            onComplete({
                inputMode: activeTab,
                description,
                websiteUrl: activeTab === 'url' ? finalWebsiteUrl : websiteUrl,
                pdfFile,
                logoFile
            });
        }
    };

    const tabs = [
        { id: 'description', label: 'Text Description', icon: AlignLeft },
        { id: 'url', label: 'Website URL', icon: Globe },
        { id: 'pdf', label: 'Upload PDF', icon: FileText },
    ];

    return (
        <div className="animate-fade-in-up">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 rounded-lg overflow-hidden mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-white text-primary border-t-2 border-t-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Content (Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tab 1: Text Description */}
                    {activeTab === 'description' && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Business Description <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    error={showError && description.trim().length <= 10 ? "Please enter a detailed business description (min 10 chars)" : undefined}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="We are a premium coffee subscription service based in Mumbai, India, targeting busy professionals who want fresh, ethically sourced beans delivered monthly at ₹999/month..."
                                    className="min-h-[220px] text-base leading-relaxed resize-none p-4"
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <Globe className="w-4 h-4 text-blue-500" />
                                <p>Include your city/country for automatic currency & timezone detection</p>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Website URL */}
                    {activeTab === 'url' && (
                        <div className="animate-fade-in space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Your Business Website <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    error={showError && !isTabValid() ? "Please enter a valid website URL (e.g., example.com)" : undefined}
                                    type="text"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="e.g. example.com or https://example.com"
                                    className="text-lg py-3"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                <h4 className="font-semibold text-blue-900 text-sm mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    What SalesPal AI will extract:
                                </h4>
                                <ul className="space-y-2">
                                    {[
                                        'Business description & services',
                                        'Product offerings & pricing',
                                        'Target audience insights',
                                        'Location & currency detection',
                                        'Brand assets & images'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                                            <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-sm text-gray-500">
                                SalesPal AI will analyze your website to understand your business, products, and target audience.
                            </p>
                        </div>
                    )}

                    {/* Tab 3: Upload PDF */}
                    {activeTab === 'pdf' && (
                        <div className="animate-fade-in space-y-6">
                            <label className="block text-sm font-medium text-gray-900">
                                Upload Business Document (PDF) <span className="text-red-500">*</span>
                            </label>

                            <FileUploadBox
                                error={showError && !pdfFile}
                                selectedFile={pdfFile}
                                onFileSelect={setPdfFile}
                                className="min-h-[200px]"
                                title="Click to upload PDF"
                                subtitle="Business plan, brochure, or product catalog"
                                accept={{ 'application/pdf': ['.pdf'] }}
                            />

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="font-semibold text-gray-900 text-sm mb-3">Supported documents:</h4>
                                <ul className="grid grid-cols-2 gap-2">
                                    {[
                                        'Business plans & proposals',
                                        'Product catalogs & brochures',
                                        'Marketing materials',
                                        'Company profiles'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Logo Upload (Always Visible) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Upload brand logo</label>

                        <div
                            {...getLogoRootProps()}
                            className={`
                                aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer bg-gray-50/50
                                ${isLogoDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'}
                            `}
                        >
                            <input {...getLogoInputProps()} />

                            {logoFile ? (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    <img
                                        src={logoFile.preview}
                                        alt="Logo Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                        Click to change
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 mb-1">Upload Logo</span>
                                    <span className="text-xs text-gray-500">PNG or JPG, max 2MB</span>
                                </>
                            )}
                        </div>

                        <p className="mt-3 text-xs text-gray-500 leading-relaxed text-center px-2">
                            Your logo will appear on all ad creatives by default
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 pt-6 border-t border-gray-100">
                <Button
                    size="lg"
                    className="w-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow flex items-center justify-center"
                    onClick={handleNext}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Business...</>
                    ) : (
                        "✨ Let SalesPal AI Understand My Business"
                    )}
                </Button>
            </div>
        </div>
    );
};

export default StepBusinessInput;

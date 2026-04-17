import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import { Search, Info, UploadCloud, Link as LinkIcon, FileText, AlertCircle, CheckCircle2, X, Image as ImageIcon, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return ImageIcon;
    if (type?.includes('pdf')) return FileText;
    return File;
};

const Step3Property = ({ formData, updateFormData, onNext, onBack }) => {
    const [fetching, setFetching] = useState(false);
    const [touched, setTouched] = useState({ propertyName: false, description: false, website: false });
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [brochureError, setBrochureError] = useState('');
    const [brochurePreview, setBrochurePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const brochureInputRef = useRef(null);

    const ACCEPTED_BROCHURE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleBrochureSelect = (file) => {
        setBrochureError('');
        if (!file) return;

        if (!ACCEPTED_BROCHURE_TYPES.includes(file.type)) {
            setBrochureError('Unsupported file type. Please upload a PDF, Image, or Word document.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setBrochureError(`File too large (${formatFileSize(file.size)}). Maximum size is 5MB.`);
            return;
        }

        updateFormData({ brochureFile: file });

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setBrochurePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setBrochurePreview(null);
        }
    };

    const handleBrochureRemove = () => {
        updateFormData({ brochureFile: null });
        setBrochurePreview(null);
        setBrochureError('');
        if (brochureInputRef.current) brochureInputRef.current.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleBrochureSelect(file);
    };

    // --- Validation ---
    const propertyNameValidation = (() => {
        const trimmed = (formData.propertyName || '').trim();
        if (trimmed.length === 0) return { valid: false, error: 'Product / Property name is required' };
        if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
        if (trimmed.length > 100) return { valid: false, error: 'Name must be under 100 characters' };
        return { valid: true, error: '' };
    })();

    const descriptionValidation = (() => {
        const trimmed = (formData.description || '').trim();
        if (trimmed.length === 0) return { valid: false, error: 'A brief description is required for the AI to work effectively' };
        if (trimmed.length < 10) return { valid: false, error: 'Description should be at least 10 characters for best results' };
        return { valid: true, error: '' };
    })();

    const websiteValidation = (() => {
        const trimmed = (formData.website || '').trim();
        if (trimmed.length === 0) return { valid: true, error: '' }; // optional
        // Accept both full URLs (https://site.com) and bare domains (site.com)
        const urlRegex = /^(?:https?:\/\/)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+(?:[\/\w\-.~:?#[\]@!$&'()*+,;=]*)?$/;
        if (!urlRegex.test(trimmed)) return { valid: false, error: 'Enter a valid website (e.g. your-site.com)' };
        return { valid: true, error: '' };
    })();

    const isValid = propertyNameValidation.valid && descriptionValidation.valid;
    const shouldShowError = (field) => touched[field] || attemptedSubmit;

    const getInputBorderClass = (validation, field) => {
        if (validation.valid && (formData[field] || '').trim().length > 0) return 'border-green-300 focus:ring-green-500';
        if (!validation.valid && shouldShowError(field)) return 'border-red-300 focus:ring-red-500';
        return 'border-gray-300 focus:ring-blue-500';
    };

    const handleNext = () => {
        setAttemptedSubmit(true);
        setTouched({ propertyName: true, description: true, website: true });
        if (isValid) onNext();
    };

    // Ensure the URL has a protocol prefix for fetching
    const getNormalizedUrl = () => {
        const trimmed = (formData.website || '').trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
    };

    const handleFetch = () => {
        if (!formData.website || !websiteValidation.valid) return;
        setFetching(true);
        const url = getNormalizedUrl();
        // Simulate fetching website info
        setTimeout(() => {
            if (!formData.propertyName) updateFormData({ propertyName: 'Extracted Property Name' });
            if (!formData.description) updateFormData({ description: 'Automatically extracted description from website. This is a premium property offering.' });
            setFetching(false);
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">What are you selling?</h2>
                <p className="text-gray-500 mt-2">Give the AI context about the product, service, or property.</p>
            </div>

            <div className="space-y-5">
                {/* Auto-fill Section */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Auto-fill from Website (Optional)
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                className={`w-full px-4 py-2 text-sm rounded-lg border ${websiteValidation.valid ? 'border-blue-200' : 'border-red-300'} focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                placeholder="your-website.com"
                                value={formData.website}
                                onChange={(e) => updateFormData({ website: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, website: true }))}
                            />
                            <AnimatePresence>
                                {!websiteValidation.valid && shouldShowError('website') && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                    >
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {websiteValidation.error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={handleFetch}
                            disabled={fetching || !formData.website || !websiteValidation.valid}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 self-start"
                        >
                            {fetching ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Fetching...</> : 'Fetch Details'}
                        </button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {/* Property Name */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product / Property Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full px-4 pr-10 py-2.5 rounded-lg border ${getInputBorderClass(propertyNameValidation, 'propertyName')} focus:ring-2 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                placeholder="e.g. Sunset Villas, SaaS Platform X"
                                value={formData.propertyName}
                                onChange={(e) => updateFormData({ propertyName: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, propertyName: true }))}
                            />
                            {propertyNameValidation.valid && formData.propertyName.trim().length > 0 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                        </div>
                        <AnimatePresence>
                            {!propertyNameValidation.valid && shouldShowError('propertyName') && formData.propertyName.length > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {propertyNameValidation.error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Location (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Location <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            placeholder="e.g. Miami, FL / Global"
                            value={formData.location}
                            onChange={(e) => updateFormData({ location: e.target.value })}
                        />
                    </div>

                    {/* Price (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price or Offer <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            placeholder="e.g. $500,000 or 20% off"
                            value={formData.price}
                            onChange={(e) => updateFormData({ price: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <textarea
                                rows={3}
                                className={`w-full px-4 py-2.5 rounded-lg border ${getInputBorderClass(descriptionValidation, 'description')} focus:ring-2 outline-none resize-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                placeholder="Describe the key selling points, benefits, and features..."
                                value={formData.description}
                                onChange={(e) => updateFormData({ description: e.target.value })}
                                onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                            />
                            {descriptionValidation.valid && formData.description.trim().length > 0 && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <AnimatePresence>
                                {!descriptionValidation.valid && shouldShowError('description') && formData.description.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-xs text-red-500 flex items-center gap-1"
                                    >
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {descriptionValidation.error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <span className={`text-xs ml-auto ${formData.description.trim().length < 10 ? 'text-gray-400' : 'text-green-500'}`}>
                                {formData.description.trim().length} characters
                            </span>
                        </div>
                    </div>

                    {/* Optional File Upload */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            Brochure / Deck <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>

                        <input
                            ref={brochureInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleBrochureSelect(e.target.files?.[0])}
                        />

                        {!formData.brochureFile ? (
                            <div
                                onClick={() => brochureInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging
                                        ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                                        : brochureError
                                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                            >
                                <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-gray-600">
                                    {isDragging ? 'Drop your file here' : 'Click to upload or drag & drop'}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">PDF, Image, or Word · Max 5MB</span>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="border border-green-200 bg-green-50 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-3">
                                    {brochurePreview ? (
                                        <img
                                            src={brochurePreview}
                                            alt="Preview"
                                            className="w-14 h-14 object-cover rounded-lg border border-green-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center">
                                            {(() => { const Icon = getFileIcon(formData.brochureFile.type); return <Icon className="w-7 h-7 text-green-600" />; })()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{formData.brochureFile.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatFileSize(formData.brochureFile.size)} · {formData.brochureFile.type.split('/').pop().toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <button
                                            onClick={handleBrochureRemove}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors group"
                                        >
                                            <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {brochureError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {brochureError}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Submit Error Summary */}
            <AnimatePresence>
                {attemptedSubmit && !isValid && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Please fill in the required fields (Product Name and Description) before continuing.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-6 flex gap-4 justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={attemptedSubmit && !isValid}
                    className={`px-8 ${attemptedSubmit && !isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Continue to Script
                </Button>
            </div>
        </div>
    );
};

export default Step3Property;

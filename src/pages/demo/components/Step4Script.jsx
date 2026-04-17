import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import { Sparkles, FileText, Edit3, Loader2, AlertCircle, CheckCircle2, X, UploadCloud, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const options = [
    { id: 'ai', label: 'AI Generate', icon: Sparkles },
    { id: 'upload', label: 'Upload File', icon: FileText },
    { id: 'manual', label: 'Manual Input', icon: Edit3 }
];

const Step4Script = ({ formData, updateFormData, onNext, onBack }) => {
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [touched, setTouched] = useState(false);
    const [scriptFileError, setScriptFileError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [readingFile, setReadingFile] = useState(false);
    const scriptFileInputRef = useRef(null);

    const ACCEPTED_SCRIPT_TYPES = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleScriptFileSelect = (file) => {
        setScriptFileError('');
        if (!file) return;

        // Check file extension as a fallback (some systems don't set MIME correctly)
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExts = ['txt', 'pdf', 'doc', 'docx'];

        if (!ACCEPTED_SCRIPT_TYPES.includes(file.type) && !validExts.includes(ext)) {
            setScriptFileError('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setScriptFileError(`File too large (${formatFileSize(file.size)}). Maximum size is 5MB.`);
            return;
        }

        updateFormData({ scriptFile: file });

        // If it's a text file, read its content into the script textarea
        if (file.type === 'text/plain' || ext === 'txt') {
            setReadingFile(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                updateFormData({ scriptContent: text });
                setReadingFile(false);
            };
            reader.onerror = () => {
                setScriptFileError('Failed to read file content.');
                setReadingFile(false);
            };
            reader.readAsText(file);
        } else {
            // For PDF/DOCX, we can't read client-side easily — just show the file is attached
            // and set a placeholder script content
            updateFormData({
                scriptContent: `[Script loaded from: ${file.name}]\n\nThe AI will use the content from your uploaded ${ext?.toUpperCase()} file as the call script.`
            });
        }
    };

    const handleScriptFileRemove = () => {
        updateFormData({ scriptFile: null, scriptContent: '' });
        setScriptFileError('');
        if (scriptFileInputRef.current) scriptFileInputRef.current.value = '';
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleScriptFileSelect(file);
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            const defaultScript = `Hi ${formData.name ? 'there' : ''}, this is the AI assistant calling from SalesPal.\n\nI noticed you're interested in ${formData.propertyName || 'our offering'}. ${formData.description ? 'I understand it features ' + formData.description.substring(0, 50) + '...' : ''}\n\nI'm calling to see if you have a few minutes to discuss how this aligns with your current goals. Does this sound like something you'd like to explore further?`;
            updateFormData({ scriptContent: defaultScript });
            setGenerating(false);
            setGenerated(true);
        }, 2000);
    };

    // --- Validation ---
    const scriptValidation = (() => {
        if (formData.scriptOption === 'upload') {
            if (!formData.scriptFile) return { valid: false, error: 'Please upload a script file' };
            return { valid: true, error: '' };
        }
        const trimmed = (formData.scriptContent || '').trim();
        if (trimmed.length === 0) return { valid: false, error: 'Script content is required' };
        if (trimmed.length < 20) return { valid: false, error: 'Script should be at least 20 characters for a meaningful conversation' };
        return { valid: true, error: '' };
    })();

    const isValid = scriptValidation.valid;

    const handleNext = () => {
        setAttemptedSubmit(true);
        setTouched(true);
        if (isValid) onNext();
    };

    const shouldShowError = touched || attemptedSubmit;

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Configure Call Script</h2>
                <p className="text-gray-500 mt-2">How should the AI talk to you?</p>
            </div>

            {/* Toggle Options */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                {options.map(opt => {
                    const Icon = opt.icon;
                    const isActive = formData.scriptOption === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => {
                                updateFormData({ scriptOption: opt.id });
                                if (opt.id !== 'ai') setGenerated(false);
                                setAttemptedSubmit(false);
                                setTouched(false);
                                setScriptFileError('');
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[200px]">
                {formData.scriptOption === 'ai' && (
                    <div className="space-y-4">
                        {!generated && (
                            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <Sparkles className="w-10 h-10 text-blue-500 mb-3" />
                                <h3 className="font-medium text-gray-900 mb-1">Auto-Generate Script</h3>
                                <p className="text-sm text-gray-500 text-center mb-4 max-w-sm">
                                    AI will create a custom cold-call script based on the contextual details you provided.
                                </p>
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-75"
                                >
                                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {generating ? 'Generating Magic...' : 'Generate Script Now'}
                                </button>
                                {/* Show hint if user tries to proceed without generating */}
                                <AnimatePresence>
                                    {attemptedSubmit && !generated && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="mt-4 text-xs text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please generate a script first, or switch to manual input.
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        {generated && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Generated Script (You can edit it):</label>
                                <textarea
                                    rows={6}
                                    className={`w-full px-4 py-3 rounded-xl border ${!scriptValidation.valid && shouldShowError ? 'border-red-300 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                                        } focus:ring-2 outline-none bg-blue-50/30 resize-none font-medium text-gray-700 transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                    value={formData.scriptContent}
                                    onChange={(e) => updateFormData({ scriptContent: e.target.value })}
                                    onBlur={() => setTouched(true)}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <AnimatePresence>
                                        {!scriptValidation.valid && shouldShowError && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-xs text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="w-3 h-3 shrink-0" /> {scriptValidation.error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <span className={`text-xs ml-auto ${formData.scriptContent.trim().length < 20 ? 'text-gray-400' : 'text-green-500'}`}>
                                        {formData.scriptContent.trim().length} characters
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {formData.scriptOption === 'upload' && (
                    <div className="space-y-4">
                        <input
                            ref={scriptFileInputRef}
                            type="file"
                            accept=".txt,.pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleScriptFileSelect(e.target.files?.[0])}
                        />

                        {!formData.scriptFile ? (
                            <div
                                onClick={() => scriptFileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging
                                        ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                                        : scriptFileError
                                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                            >
                                <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="font-medium text-gray-700 mb-1">
                                    {isDragging ? 'Drop your script file here' : 'Click to upload or drag & drop'}
                                </span>
                                <span className="text-xs text-gray-500">Supported: .txt, .pdf, .docx · Max 5MB</span>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="border border-green-200 bg-green-50 rounded-xl p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{formData.scriptFile.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatFileSize(formData.scriptFile.size)} · {formData.scriptFile.name.split('.').pop()?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <button
                                            onClick={handleScriptFileRemove}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors group"
                                        >
                                            <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Show extracted text content if available */}
                                {formData.scriptContent && !formData.scriptContent.startsWith('[Script loaded') && (
                                    <div className="mt-3 border-t border-green-200 pt-3">
                                        <label className="block text-xs font-medium text-green-800 mb-1">Extracted script content:</label>
                                        <div className="bg-white/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                            <p className="text-xs text-gray-700 whitespace-pre-wrap">{formData.scriptContent.substring(0, 500)}{formData.scriptContent.length > 500 ? '...' : ''}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {readingFile && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Reading file content...
                            </div>
                        )}

                        <AnimatePresence>
                            {scriptFileError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3 shrink-0" /> {scriptFileError}
                                </motion.p>
                            )}
                            {attemptedSubmit && !formData.scriptFile && !scriptFileError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please upload a script file to continue.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {formData.scriptOption === 'manual' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter your script below:</label>
                        <textarea
                            rows={8}
                            className={`w-full px-4 py-3 rounded-xl border ${!scriptValidation.valid && shouldShowError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                } focus:ring-2 outline-none resize-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                            placeholder="Type exactly what you want the AI to say..."
                            value={formData.scriptContent}
                            onChange={(e) => updateFormData({ scriptContent: e.target.value })}
                            onBlur={() => setTouched(true)}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <AnimatePresence>
                                {!scriptValidation.valid && shouldShowError && formData.scriptContent.length > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-xs text-red-500 flex items-center gap-1"
                                    >
                                        <AlertCircle className="w-3 h-3 shrink-0" /> {scriptValidation.error}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <span className={`text-xs ml-auto ${formData.scriptContent.trim().length < 20 ? 'text-gray-400' : 'text-green-500'}`}>
                                {formData.scriptContent.trim().length} characters
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 flex gap-4 justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={attemptedSubmit && !isValid}
                    className={`px-8 ${(attemptedSubmit && !isValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Review Setup
                </Button>
            </div>
        </div>
    );
};

export default Step4Script;

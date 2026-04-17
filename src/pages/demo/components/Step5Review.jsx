import React from 'react';
import Button from '../../../components/ui/Button';
import { User, Phone, Megaphone, MapPin, Tag, FileText, Paperclip } from 'lucide-react';

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const Step5Review = ({ formData, onNext, onBack }) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Ready for the Call?</h2>
                <p className="text-gray-500 mt-2">Review your configuration before initiating the AI call.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-6">

                {/* Contact Section */}
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Target Contact</h4>
                        <p className="text-gray-800 font-medium">{formData.name}</p>
                        <p className="text-gray-600 font-mono text-sm">{formData.phone}</p>
                        {formData.email && <p className="text-gray-600 text-sm">{formData.email}</p>}
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* Context Section */}
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <Megaphone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="w-full">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Demo Context</h4>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Plan Role:</span>
                                <span className="text-sm font-semibold text-gray-900 capitalize">{formData.plan.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Property/Product:</span>
                                <span className="text-sm font-medium text-gray-900">{formData.propertyName}</span>
                            </div>
                            {formData.location && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Location:</span>
                                    <span className="text-sm font-medium text-gray-900">{formData.location}</span>
                                </div>
                            )}
                            {formData.price && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Price/Offer:</span>
                                    <span className="text-sm font-medium text-secondary">{formData.price}</span>
                                </div>
                            )}
                            {formData.brochureFile && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Brochure:</span>
                                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                        <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                                        {formData.brochureFile.name}
                                        <span className="text-gray-400 font-normal">({formatFileSize(formData.brochureFile.size)})</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* Script Section */}
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="w-full">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">AI Script Preview</h4>

                        {formData.scriptFile && (
                            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-500 shrink-0" />
                                <span className="text-sm text-gray-700 font-medium truncate">{formData.scriptFile.name}</span>
                                <span className="text-xs text-gray-400 shrink-0">({formatFileSize(formData.scriptFile.size)})</span>
                            </div>
                        )}

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-700 italic border-l-2 border-green-400 pl-3">
                                "{formData.scriptContent.substring(0, 150)}{formData.scriptContent.length > 150 ? '...' : ''}"
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-8 flex gap-4 justify-between">
                <Button variant="secondary" onClick={onBack}>
                    Back to Edit
                </Button>
                <button
                    onClick={onNext}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                    <Phone className="w-5 h-5" />
                    Start AI Demo Call
                </button>
            </div>
        </div>
    );
};

export default Step5Review;

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

const DocumentUploader = ({ fileType = 'excel', onUploadComplete, onCancel }) => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            
            // Validate file type
            const allowedTypes = {
                excel: ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                pdf: ['application/pdf']
            };
            
            const validTypes = allowedTypes[fileType] || allowedTypes.excel;
            
            if (validTypes.includes(file.type) || file.name.match(/\.(csv|xlsx|xls|pdf)$/i)) {
                setUploadedFile(file);
                setError('');
            } else {
                setError('Invalid file type. Please upload CSV, Excel, or PDF.');
            }
        }
    }, [fileType]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: fileType === 'pdf' 
            ? { 'application/pdf': ['.pdf'] }
            : {
                'text/csv': ['.csv'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            },
        multiple: false,
        disabled: isAnalyzing
    });

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setIsAnalyzing(true);
        setError('');
        console.log('[DocumentUploader] handleUpload started, file:', uploadedFile.name);

        try {
            // MOCK DATA - Replace this with real API call when Gemini API is ready
            console.log('[DocumentUploader] Using MOCK data for testing');
            const mockCustomers = [
                {
                    name: 'Baki Hanma',
                    phone: '9876543210',
                    email: 'baki@example.com',
                    company: 'Warriors Inc',
                    totalAmount: 50000,
                    totalDue: 50000,
                    amountPaid: 15000,
                    paidAmount: 15000,
                    dueDate: '2026-04-18',
                    currency: 'INR',
                    status: 'active'
                },
                {
                    name: 'Keisuke Takeda',
                    phone: '8765432109',
                    email: 'keisuke@example.com',
                    company: 'Dragon Corp',
                    totalAmount: 35000,
                    totalDue: 35000,
                    amountPaid: 10000,
                    paidAmount: 10000,
                    dueDate: '2026-04-20',
                    currency: 'INR',
                    status: 'active'
                },
                {
                    name: 'Joji Hanma',
                    phone: '7654321098',
                    email: 'joji@example.com',
                    company: 'Titan Group',
                    totalAmount: 72000,
                    totalDue: 72000,
                    amountPaid: 20000,
                    paidAmount: 20000,
                    dueDate: '2026-05-01',
                    currency: 'INR',
                    status: 'active'
                },
                {
                    name: 'Riku Hanma',
                    phone: '6543210987',
                    email: 'riku@example.com',
                    company: 'Phoenix Tech',
                    totalAmount: 45000,
                    totalDue: 45000,
                    amountPaid: 5000,
                    paidAmount: 5000,
                    dueDate: '2026-04-15',
                    currency: 'INR',
                    status: 'active'
                },
                {
                    name: 'Yuri Boyka',
                    phone: '5432109876',
                    email: 'yuri@example.com',
                    company: 'Steel Industries',
                    totalAmount: 60000,
                    totalDue: 60000,
                    amountPaid: 25000,
                    paidAmount: 25000,
                    dueDate: '2026-04-25',
                    currency: 'INR',
                    status: 'active'
                }
            ];

            setIsAnalyzing(false);
            console.log('[DocumentUploader] Mock data ready:', mockCustomers.length, 'customers');
            if (onUploadComplete) {
                onUploadComplete(mockCustomers);
            }

            /* REAL API CALL - Uncomment when Gemini API is ready
            const formData = new FormData();
            formData.append('file', uploadedFile);

            console.log('[DocumentUploader] Sending POST to /post-sales/customers/upload');
            const response = await api.post(
                '/post-sales/customers/upload',
                formData
            );

            console.log('[DocumentUploader] Response received:', response);

            if (response && response.customers && Array.isArray(response.customers)) {
                // Format customers for list display
                console.log('[DocumentUploader] Response has valid customers array, count:', response.customers.length);
                const formattedCustomers = response.customers.map(customer => ({
                    name: customer.name || '',
                    phone: customer.phone || '',
                    email: customer.email || '',
                    company: customer.company || '',
                    totalAmount: customer.totalAmount || customer.totalDue || 0,
                    totalDue: customer.totalDue || customer.totalAmount || 0,
                    amountPaid: customer.amountPaid || customer.paid || 0,
                    paidAmount: customer.paidAmount || customer.amountPaid || 0,
                    dueDate: customer.dueDate || '',
                    currency: customer.currency || 'INR',
                    status: 'active'
                }));

                setIsAnalyzing(false);
                console.log('[DocumentUploader] Calling onUploadComplete with', formattedCustomers.length, 'customers');
                if (onUploadComplete) {
                    onUploadComplete(formattedCustomers);
                } else {
                    console.warn('[DocumentUploader] onUploadComplete callback not defined!');
                }
            } else {
                console.error('[DocumentUploader] Invalid response format. Expected {customers: [...]}, got:', response);
                throw new Error('Invalid response format from server. Expected {customers: [...]}');
            }
            */
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err.message || 'Failed to upload and analyze file. Please try again.');
            setIsAnalyzing(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setError('');
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="w-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Upload Customer Details</h2>
                    <p className="text-sm text-gray-500 mt-1">{fileType === 'pdf' ? 'PDF file' : 'Excel, CSV or PDF file'}</p>
                    <p className="text-xs text-amber-600 mt-2">⚠️ Using MOCK data for testing - Replace with real API when ready</p>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 flex-1 flex flex-col">
                    {/* Drop Zone or File Display */}
                    {!uploadedFile ? (
                        <div
                            {...getRootProps()}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex-1 flex flex-col justify-center
              ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        >
                            <input {...getInputProps()} />
                            <motion.div
                                animate={{ scale: isDragActive ? 1.1 : 1 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <Upload className={`w-8 h-8 ${isDragActive ? 'text-indigo-500' : 'text-gray-300'}`} />
                                <p className="text-sm font-medium text-gray-600">
                                    {isDragActive ? 'Drop to upload' : 'Drag & drop file here or click to select'}
                                </p>
                                <p className="text-xs text-gray-400">{fileType === 'pdf' ? 'PDF only' : 'PDF, CSV, or Excel files'}</p>
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    disabled={isAnalyzing}
                                    className="p-1 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {/* Upload Status */}
                            {isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3"
                                >
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Uploading and analyzing...</p>
                                        <p className="text-xs text-blue-700">Extracting customer details from file</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                    <button
                        onClick={onCancel}
                        disabled={isAnalyzing}
                        className="px-6 py-2 border border-gray-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!uploadedFile || isAnalyzing}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isAnalyzing ? 'bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                            </>
                        ) : (
                            'Upload & Analyze'
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DocumentUploader;

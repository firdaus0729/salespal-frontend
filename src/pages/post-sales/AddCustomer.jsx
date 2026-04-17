import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, FileText, PenLine, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCustomerOptionCard from './components/AddCustomerOptionCard';
import PlainTextParser from './components/PlainTextParser';
import DocumentUploader from './components/DocumentUploader';
import ExtractedDetailsView from './components/ExtractedDetailsView';
import ManualEntryForm from './components/ManualEntryForm';
import CustomerListView from './components/CustomerListView';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('method'); // method | upload | list | details
    const [activeMethod, setActiveMethod] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [extractedDataList, setExtractedDataList] = useState(null);
    const [uploadedCustomers, setUploadedCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const OPTIONS = [
        {
            id: 'excel',
            icon: <FileSpreadsheet className="w-6 h-6" />,
            title: 'Upload Excel / CSV',
            description: 'Upload your spreadsheet with customer payment data'
        },
        {
            id: 'pdf',
            icon: <FileText className="w-6 h-6" />,
            title: 'Upload PDF',
            description: 'Upload invoices or statements in PDF format'
        },
        {
            id: 'manual',
            icon: <PenLine className="w-6 h-6" />,
            title: 'Manual Entry',
            description: 'Enter customer details using a simple form'
        },
        {
            id: 'plaintext',
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'Type in Plain Text',
            description: 'Just describe it like: "Amit owes 32,000. Paid 12,000. Balance due on 18th."'
        }
    ];

    const handleAnalysisComplete = (data, mode = 'single') => {
        if (mode === 'bulk' && Array.isArray(data)) {
            setExtractedDataList(data);
        } else {
            setExtractedData(data);
        }
    };

    // Handle file upload - shows customer list
    const handleFileUpload = (customers) => {
        console.log('[AddCustomer] handleFileUpload called with', customers?.length || 0, 'customers');
        console.log('[AddCustomer] Customers data:', customers);
        setUploadedCustomers(customers);
        setStep('list');
        console.log('[AddCustomer] Step set to: list');
    };

    // Handle customer selection from list
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setExtractedData(customer);
        setStep('details');
    };

    // Handle back from details to list
    const handleBackToList = () => {
        setExtractedData(null);
        setSelectedCustomer(null);
        setStep('list');
    };

    // Handle back from list to upload
    const handleBackToUpload = () => {
        setUploadedCustomers([]);
        setStep('upload');
    };

    // Handle back from upload to method selection
    const handleBackToMethod = () => {
        setUploadedCustomers([]);
        setStep('method');
        setActiveMethod(null);
    };

    const handleCancel = () => {
        setExtractedData(null);
        setExtractedDataList(null);
        setUploadedCustomers([]);
        setSelectedCustomer(null);
        setStep('method');
        setActiveMethod(null);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-4">

            {/* Back & Header - Show for method selection only */}
            {step === 'method' && (
                <div className="space-y-4">
                    <button onClick={() => navigate('/post-sales')}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 w-fit shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            How would you like to add post-sale data?
                        </h1>
                        <p className="text-gray-500 mt-1.5">
                            Choose the method that works best for you
                        </p>
                    </div>
                </div>
            )}

            {/* Grid of Options - Show for method selection only */}
            {step === 'method' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {OPTIONS.map((opt, i) => (
                        <motion.div key={opt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <AddCustomerOptionCard
                                {...opt}
                                isActive={activeMethod === opt.id}
                                onClick={() => {
                                    setActiveMethod(opt.id);
                                    setStep('upload');
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Dynamic Render based on Step */}
            <AnimatePresence mode="wait">
                {/* Plain Text Parser - Step: upload */}
                {step === 'upload' && activeMethod === 'plaintext' && (
                    <PlainTextParser 
                        key="plaintext" 
                        onSuccess={handleAnalysisComplete}
                        onCancel={handleBackToMethod}
                    />
                )}

                {/* Document Uploader for Excel/CSV - Step: upload */}
                {step === 'upload' && (activeMethod === 'excel' || activeMethod === 'pdf') && (
                    <DocumentUploader 
                        key={activeMethod}
                        fileType={activeMethod}
                        onUploadComplete={handleFileUpload}
                        onCancel={handleBackToMethod}
                    />
                )}

                {/* Manual Entry Form - Step: upload */}
                {step === 'upload' && activeMethod === 'manual' && (
                    <ManualEntryForm 
                        key="manual"
                        onSuccess={handleAnalysisComplete}
                        onCancel={handleBackToMethod}
                    />
                )}

            {/* Customer List View - Step: list */}
                {(() => {
                    const shouldShow = step === 'list' && uploadedCustomers.length > 0;
                    console.log('[AddCustomer] Render check - step:', step, 'uploadedCustomers:', uploadedCustomers.length, 'shouldShow:', shouldShow);
                    return shouldShow && (
                        <CustomerListView 
                            key="list"
                            customers={uploadedCustomers}
                            onSelectCustomer={handleSelectCustomer}
                            onCancel={handleBackToUpload}
                        />
                    );
                })()}

                {/* Extracted Details View - Step: details (single customer from any method) */}
                {(() => {
                    const shouldShow = step === 'details' && extractedData;
                    console.log('[AddCustomer] Details render check - step:', step, 'extractedData exists:', !!extractedData, 'shouldShow:', shouldShow);
                    return shouldShow && (
                        <ExtractedDetailsView 
                            key="details"
                            customerData={extractedData}
                            onCancel={activeMethod === 'excel' || activeMethod === 'pdf' ? handleBackToList : handleCancel}
                        />
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default AddCustomer;

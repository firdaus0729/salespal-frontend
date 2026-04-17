import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';

const FileUploadBox = ({ onFileSelect, selectedFile, error, className }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        multiple: false
    });

    const removeFile = (e) => {
        e.stopPropagation();
        onFileSelect(null);
    };

    if (selectedFile) {
        return (
            <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-red-500">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <button
                    onClick={removeFile}
                    className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-secondary bg-secondary/5' : ''}
                ${!isDragActive && !error ? 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50' : ''}
                ${error ? 'border-red-500 bg-red-50' : ''}
                ${className || ''}
            `}
        >
            <input {...getInputProps()} />
            <div className={`
                w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-colors
                ${isDragActive ? 'bg-secondary/20 text-secondary' : ''}
                ${!isDragActive && !error ? 'bg-gray-100 text-gray-400' : ''}
                ${error ? 'bg-red-100 text-red-500' : ''}
            `}>
                <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            <p className={`text-xs mt-1 ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {error ? 'Please upload a PDF document' : 'PDF files only (max 10MB)'}
            </p>
        </div>
    );
};

export default FileUploadBox;

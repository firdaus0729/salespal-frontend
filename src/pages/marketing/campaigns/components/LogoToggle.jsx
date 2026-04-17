import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const LogoToggle = ({ useLogo, onToggle, logoFile, onLogoChange, compact = false }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = Object.assign(acceptedFiles[0], {
                preview: URL.createObjectURL(acceptedFiles[0])
            });
            onLogoChange(file);
        }
    }, [onLogoChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        },
        maxFiles: 1,
        multiple: false,
        disabled: !useLogo
    });

    const removeLogo = (e) => {
        e.stopPropagation();
        onLogoChange(null);
    };

    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Enable Logo</span>
                    <button
                        onClick={() => onToggle(!useLogo)}
                        className={`
                            relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
                            ${useLogo ? 'bg-secondary' : 'bg-gray-200'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                                ${useLogo ? 'translate-x-5' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>

                {useLogo && (
                    <div className="animate-fade-in-down">
                        {logoFile ? (
                            <div className="relative group w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                                <img src={logoFile.preview} alt="Logo" className="max-h-full max-w-full object-contain" />
                                <button
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div
                                {...getRootProps()}
                                className={`
                                    w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2
                                    ${isDragActive ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50'}
                                `}
                            >
                                <input {...getInputProps()} />
                                <Upload className="w-4 h-4 text-gray-400 mb-1" />
                                <span className="text-[10px] text-gray-500">Click or Drag</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <span className="block text-sm font-medium text-gray-700">Brand Logo</span>
                    <span className="text-xs text-gray-500">Include your logo in ads</span>
                </div>
                <button
                    onClick={() => onToggle(!useLogo)}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
                        ${useLogo ? 'bg-secondary' : 'bg-gray-200'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${useLogo ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
            </div>

            {useLogo && (
                <div className="animate-fade-in-down">
                    {logoFile ? (
                        <div className="relative w-24 h-24 group">
                            <img
                                src={logoFile.preview}
                                alt="Logo"
                                className="w-full h-full object-contain p-2 rounded-xl border border-gray-200 bg-white"
                            />
                            <button
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div
                            {...getRootProps()}
                            className={`
                                w-full max-w-[200px] h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                                ${isDragActive ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50'}
                            `}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Upload Logo</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LogoToggle;

import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Video, X } from 'lucide-react';
import Button from '../../../../../components/ui/Button';

const MediaUploadSection = ({ onUpload, currentMedia, onClear, format = 'image' }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a local preview URL
        const previewUrl = URL.createObjectURL(file);

        if (onUpload) {
            onUpload({
                file,
                url: previewUrl,
                type: file.type.startsWith('image/') ? 'image' : 'video'
            });
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Upload className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">Use Your Own Media</h4>
                        <p className="text-xs text-gray-500">Upload your own content to preview without using credits.</p>
                    </div>
                </div>
            </div>

            {currentMedia ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
                    {currentMedia.type === 'video' ? (
                        <video
                            src={currentMedia.url}
                            className="w-full h-full object-contain"
                            controls
                        />
                    ) : (
                        <img
                            src={currentMedia.url}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain"
                        />
                    )}

                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors"
                        title="Remove media"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={triggerUpload}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept={format === 'video' ? "video/*" : "image/*"}
                        onChange={handleFileChange}
                    />

                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {format === 'video' ? (
                            <Video className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        )}
                    </div>

                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload {format}
                    </p>
                    <p className="text-xs text-gray-400">
                        Supports {format === 'video' ? 'MP4, MOV' : 'JPG, PNG, WEBP'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MediaUploadSection;

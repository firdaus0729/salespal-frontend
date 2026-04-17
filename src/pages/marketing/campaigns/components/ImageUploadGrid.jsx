import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, X, Image as ImageIcon } from 'lucide-react';

const ImageUploadGrid = ({ images, onImagesChange }) => {
    const onDrop = useCallback((acceptedFiles) => {
        // Create preview URLs for new files
        const newImages = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        onImagesChange([...images, ...newImages]);
    }, [images, onImagesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        }
    });

    const removeImage = (index) => {
        const newImages = [...images];
        // Revoke preview URL to avoid memory leaks
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
                <div key={index} className="relative aspect-square group">
                    <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <button
                            onClick={() => removeImage(index)}
                            className="p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}

            <div
                {...getRootProps()}
                className={`
                    aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-secondary/50 hover:bg-gray-50'}
                `}
            >
                <input {...getInputProps()} />
                <Plus className={`w-6 h-6 mb-2 ${isDragActive ? 'text-secondary' : 'text-gray-400'}`} />
                <span className="text-xs font-medium text-gray-500">Add Image</span>
            </div>
        </div>
    );
};

export default ImageUploadGrid;

import React from 'react';
import { Image, Video, GalleryHorizontal } from 'lucide-react';

const AdTypeOption = ({ label, icon: Icon, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`
            cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200
            ${isSelected
                ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
        `}
    >
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-secondary text-primary' : 'bg-gray-100 text-gray-500'}
        `}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
            {label}
        </span>
    </div>
);

const AdTypeSelector = ({ selectedTypes, onToggle }) => {
    const handleToggle = (type) => {
        // Simple toggle logic - allows selecting multiple
        if (selectedTypes.includes(type)) {
            // Prevent deselecting the last one? Or allow it? 
            // Requirements say "User can select one or more". Let's allow deselecting but maybe handle validation later.
            onToggle(selectedTypes.filter(t => t !== type));
        } else {
            onToggle([...selectedTypes, type]);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <AdTypeOption
                label="Single Image"
                icon={Image}
                isSelected={selectedTypes.includes('image')}
                onClick={() => handleToggle('image')}
            />
            <AdTypeOption
                label="Video Ad"
                icon={Video}
                isSelected={selectedTypes.includes('video')}
                onClick={() => handleToggle('video')}
            />
            <AdTypeOption
                label="Carousel"
                icon={GalleryHorizontal}
                isSelected={selectedTypes.includes('carousel')}
                onClick={() => handleToggle('carousel')}
            />
        </div>
    );
};

export default AdTypeSelector;

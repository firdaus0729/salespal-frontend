import React from 'react';
import { Image, Video, Layers } from 'lucide-react';

const PostTypeOption = ({ id, label, icon: Icon, isSelected, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
            ${isSelected
                ? 'bg-secondary/10 border-secondary text-secondary'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }
        `}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const PostTypeSelector = ({ selectedType, onSelect }) => {
    return (
        <div className="flex items-center gap-3">
            <PostTypeOption
                id="image"
                label="Image"
                icon={Image}
                isSelected={selectedType === 'image'}
                onClick={onSelect}
            />
            <PostTypeOption
                id="video"
                label="Video"
                icon={Video}
                isSelected={selectedType === 'video'}
                onClick={onSelect}
            />
            <PostTypeOption
                id="carousel"
                label="Carousel"
                icon={Layers}
                isSelected={selectedType === 'carousel'}
                onClick={onSelect}
            />
        </div>
    );
};

export default PostTypeSelector;

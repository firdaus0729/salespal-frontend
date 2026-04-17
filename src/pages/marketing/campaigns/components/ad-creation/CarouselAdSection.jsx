import React from 'react';
import { Plus, GripVertical } from 'lucide-react';

const SlidePlaceholder = ({ index }) => (
    <div className="w-32 aspect-[4/5] bg-gray-100 rounded-lg border border-gray-200 flex flex-col relative group shrink-0">
        <div className="absolute top-2 right-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-400">Slide {index + 1}</span>
        </div>
        <div className="h-8 border-t border-gray-200 bg-white rounded-b-lg flex items-center px-2">
            <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
        </div>
    </div>
);

const CarouselAdSection = () => {
    return (
        <div className="space-y-4 animate-fade-in-up">
            <h4 className="text-sm font-semibold text-gray-900">Carousel Cards</h4>

            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[0, 1, 2].map(i => <SlidePlaceholder key={i} index={i} />)}

                <button className="w-32 aspect-[4/5] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-secondary hover:text-secondary transition-all shrink-0">
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-medium">Add Card</span>
                </button>
            </div>
        </div>
    );
};

export default CarouselAdSection;

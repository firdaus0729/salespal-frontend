import React from 'react';
import { Check } from 'lucide-react';

const ModuleSelectCard = ({
    id,
    title,
    description,
    icon: Icon,
    isSelected,
    onToggle
}) => {
    return (
        <div
            onClick={() => onToggle(id)}
            className={`group relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 h-full flex flex-col
        ${isSelected
                    ? 'bg-secondary/5 border-secondary shadow-[0_0_20px_rgba(118,247,197,0.1)]'
                    : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                }
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg transition-colors ${isSelected ? 'bg-secondary text-primary' : 'bg-white/10 text-gray-400 group-hover:text-white'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${isSelected ? 'bg-secondary border-secondary' : 'border-white/20'}
        `}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {title}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default ModuleSelectCard;

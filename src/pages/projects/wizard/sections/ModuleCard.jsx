import React from 'react';
import Card from '../../../components/ui/Card';
import { Check } from 'lucide-react';

const ModuleCard = ({
    id,
    title,
    description,
    icon: Icon,
    isSelected,
    onSelect
}) => {
    return (
        <Card
            className={`relative cursor-pointer transition-all duration-300 p-6 flex flex-col h-full border-2 ${isSelected
                    ? 'bg-secondary/10 border-secondary'
                    : 'bg-white/5 border-transparent hover:border-white/10'
                }`}
        >
            <div onClick={() => onSelect(id)} className="absolute inset-0 z-0"></div>

            <div className="flex justify-between items-start mb-4 relative z-10 pointer-events-none">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-secondary text-primary' : 'bg-white/10 text-gray-400'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {isSelected && (
                    <div className="bg-secondary text-primary rounded-full p-1">
                        <Check className="w-4 h-4" />
                    </div>
                )}
            </div>

            <h3 className={`text-lg font-bold mb-2 relative z-10 pointer-events-none ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {title}
            </h3>
            <p className="text-sm text-gray-400 relative z-10 pointer-events-none">
                {description}
            </p>
        </Card>
    );
};

export default ModuleCard;

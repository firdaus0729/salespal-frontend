import React from 'react';
import { Check, Facebook, Chrome, Youtube } from 'lucide-react'; // Using Lucide icons as proxies

const PlatformOption = ({ id, label, icon: Icon, isSelected, isRecommended, onChange }) => (
    <div
        onClick={() => onChange(id)}
        className={`
            relative cursor-pointer border rounded-xl p-4 flex items-start gap-4 transition-all duration-200
            ${isSelected
                ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
        `}
    >
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shrink-0
            ${isSelected ? 'bg-white text-secondary shadow-sm' : 'bg-gray-100 text-gray-500'}
        `}>
            <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{label}</h4>
                {isRecommended && (
                    <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full tracking-wide">
                        Recommended
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
                {id === 'meta' && "Best for visual discovery and retargeting."}
                {id === 'google' && "Capture high-intent search traffic."}
                {id === 'youtube' && "Build awareness with video ads."}
            </p>
        </div>

        <div className={`
            w-5 h-5 rounded-full border flex items-center justify-center transition-colors
            ${isSelected ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white'}
        `}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
    </div>
);

const PlatformSelector = ({ selectedPlatforms, onToggle }) => {
    const handleToggle = (id) => {
        if (selectedPlatforms.includes(id)) {
            onToggle(selectedPlatforms.filter(p => p !== id));
        } else {
            onToggle([...selectedPlatforms, id]);
        }
    };

    return (
        <div className="space-y-3">
            <PlatformOption
                id="meta"
                label="Meta Ads (Facebook & Instagram)"
                icon={Facebook}
                isSelected={selectedPlatforms.includes('meta')}
                isRecommended={true}
                onChange={handleToggle}
            />
            <PlatformOption
                id="google"
                label="Google Search Ads"
                icon={Chrome}
                isSelected={selectedPlatforms.includes('google')}
                isRecommended={true}
                onChange={handleToggle}
            />
            <PlatformOption
                id="youtube"
                label="YouTube Video Ads"
                icon={Youtube}
                isSelected={selectedPlatforms.includes('youtube')}
                isRecommended={false}
                onChange={handleToggle}
            />
        </div>
    );
};

export default PlatformSelector;

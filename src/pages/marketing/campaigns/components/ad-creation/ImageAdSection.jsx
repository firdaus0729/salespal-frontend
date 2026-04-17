import React from 'react';
import { Upload, Globe, Sparkles } from 'lucide-react';
import { useSubscription } from '../../../../../commerce/SubscriptionContext';

const OptionCard = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-300 hover:border-secondary hover:bg-secondary/5 transition-all text-gray-500 hover:text-secondary"
    >
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const ImageAdSection = () => {
    const { canConsume, consume } = useSubscription();

    const handleGenerateImage = () => {
        if (!canConsume('marketing', 'images')) {
            alert('You have reached your monthly image limit.');
            return;
        }

        consume('marketing', 'images');
        // Existing image generation logic would run here
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <h4 className="text-sm font-semibold text-gray-900">Image Creatives</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Mock Previews */}
                {[1, 2].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group cursor-pointer border border-gray-200">
                        <img
                            src={`https://source.unsplash.com/random/400x400?modern,architecture&sig=${i}`}
                            alt="Ad Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                            <span className="text-[10px] text-white font-medium">AI Generated</span>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium border border-white/50 px-2 py-1 rounded">Select</span>
                        </div>
                    </div>
                ))}

                {/* Action Cards */}
                <OptionCard icon={Upload} label="Upload Image" />
                <OptionCard icon={Sparkles} label="Generate New" onClick={handleGenerateImage} />
            </div>
        </div>
    );
};

export default ImageAdSection;

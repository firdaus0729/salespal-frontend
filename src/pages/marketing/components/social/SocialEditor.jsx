import React from 'react';
import { Wand2, Image as ImageIcon, X } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import PostTypeSelector from './PostTypeSelector';
import ScheduleSelector from './ScheduleSelector';

const SocialEditor = ({
    content,
    setContent,
    postType,
    setPostType,
    scheduleMode,
    setScheduleMode,
    onSave, // Draft
    onSchedule, // Schedule/Publish depending on mode
    isSaving
}) => {

    // Mock media upload
    const [media, setMedia] = React.useState([]);

    const handleDrop = (e) => {
        e.preventDefault();
        // Mock add
        setMedia([...media, { id: Date.now(), url: '#' }]);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50">
            {/* Toolbar / Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <h2 className="font-semibold text-gray-900">Edit Post</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 mr-2">
                        {content.length}/2200
                    </span>
                    <Button variant="secondary" onClick={onSave} disabled={isSaving}>
                        Save Draft
                    </Button>
                    <Button onClick={onSchedule} isLoading={isSaving} disabled={!content}>
                        {scheduleMode === 'now' ? 'Publish Now' : 'Schedule'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Media Section */}
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <label className="text-sm font-medium text-gray-700">Media</label>
                        <PostTypeSelector selectedType={postType} onSelect={setPostType} />
                    </div>
                    <div
                        className="p-8 border-2 border-dashed border-gray-200 m-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-primary/30 transition-all bg-white"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Drag & drop media here</p>
                        <p className="text-xs text-gray-500 mt-1">or browse files from your computer</p>
                    </div>
                </Card>

                {/* Caption Section */}
                <Card>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <label className="text-sm font-medium text-gray-700">Caption</label>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors">
                            <Wand2 className="w-3 h-3" />
                            AI Enhance
                        </button>
                    </div>
                    <div className="p-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-48 p-0 text-sm border-0 focus:ring-0 resize-none placeholder-gray-400"
                            placeholder="Write your caption here... Use @ to mention accounts and # for hashtags."
                        />
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {['#RealEstate', '#Luxury', '#NewListing', '#DreamHome'].map(tag => (
                                <button key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                                    {tag}
                                </button>
                            ))}
                            <button className="text-xs text-primary font-medium hover:underline">+ Add Hashtags</button>
                        </div>
                    </div>
                </Card>

                {/* Scheduling Section */}
                <Card className="p-0">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                        <label className="text-sm font-medium text-gray-700">Schedule</label>
                    </div>
                    <div className="p-4">
                        <ScheduleSelector scheduleMode={scheduleMode} onModeChange={setScheduleMode} />
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default SocialEditor;

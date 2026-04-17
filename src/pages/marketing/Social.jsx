import React, { useState, useEffect } from 'react';
import { useMarketing } from '../../context/MarketingContext';
import SocialSidebar from './components/social/SocialSidebar';
import SocialEditor from './components/social/SocialEditor';
import SocialRightPanel from './components/social/SocialRightPanel';
import SocialEngagementDashboard from './components/social/SocialEngagementDashboard';

const Social = () => {
    const { addSocialPost, socialPosts, deleteSocialPost } = useMarketing();

    // UI State
    const [activeTab, setActiveTab] = useState('drafts');
    const [selectedPostId, setSelectedPostId] = useState('new');

    // Editor State
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState('image');
    const [scheduleMode, setScheduleMode] = useState('now'); // 'now' | 'schedule'
    const [isSaving, setIsSaving] = useState(false);

    // Load post into editor when selected
    useEffect(() => {
        if (selectedPostId === 'new') {
            resetEditor();
        } else {
            const post = socialPosts.find(p => p.id === selectedPostId);
            if (post) {
                setContent(post.content || "");
                setPostType(post.type || 'image');
                setScheduleMode(post.scheduledFor === 'Scheduled' ? 'schedule' : 'now');
                // In real app, would also set scheduledDate etc.
            }
        }
    }, [selectedPostId, socialPosts]);

    const resetEditor = () => {
        setContent("");
        setPostType('image');
        setScheduleMode('now');
    };

    const handleCreateNew = () => {
        setSelectedPostId('new');
        setActiveTab('drafts'); // Usually new posts start as drafts
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 800));

        const newPostData = {
            id: selectedPostId === 'new' ? Date.now().toString() : selectedPostId,
            content,
            type: postType,
            status: 'draft',
            timestamp: new Date().toISOString(),
            platforms: ['Facebook', 'Instagram'] // Mock defaults
        };

        if (selectedPostId === 'new') {
            addSocialPost(newPostData);
            setSelectedPostId(newPostData.id); // Switch to editing this draft
        } else {
            // Update existing (mocking update by delete+add for now as we lack updateSocialPost in context)
            // Real app would use updateSocialPost(id, data)
            deleteSocialPost(selectedPostId);
            addSocialPost(newPostData);
        }

        setIsSaving(false);
    };

    const handleSchedule = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const status = scheduleMode === 'now' ? 'published' : 'scheduled';

        const postData = {
            id: selectedPostId === 'new' ? Date.now().toString() : selectedPostId,
            content,
            type: postType,
            status: status,
            scheduledFor: scheduleMode === 'now' ? 'Published Now' : 'Scheduled',
            timestamp: new Date().toISOString(),
            platforms: ['Facebook', 'Instagram']
        };

        if (selectedPostId !== 'new') deleteSocialPost(selectedPostId);
        addSocialPost(postData);

        setIsSaving(false);
        setActiveTab(status === 'published' ? 'published' : 'scheduled');
        setSelectedPostId('new'); // Reset to new after publish/schedule
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-8 bg-white overflow-hidden">
            {/* Left Sidebar (25%) */}
            <div className="w-80 flex-shrink-0 z-10 shadow-sm relative">
                <SocialSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    posts={socialPosts}
                    selectedPostId={selectedPostId}
                    onSelectPost={(post) => setSelectedPostId(post.id)}
                    onCreateNew={handleCreateNew}
                />
            </div>

            {/* Main Content Area */}
            {activeTab === 'engagement' ? (
                /* Full width Engagement Dashboard (takes remaining space) */
                <div className="flex-1 min-w-0 z-0">
                    <SocialEngagementDashboard posts={socialPosts} />
                </div>
            ) : (
                <>
                    {/* Center Editor (50%) */}
                    <div className="flex-1 min-w-0 z-0">
                        <SocialEditor
                            content={content}
                            setContent={setContent}
                            postType={postType}
                            setPostType={setPostType}
                            scheduleMode={scheduleMode}
                            setScheduleMode={setScheduleMode}
                            onSave={handleSave}
                            onSchedule={handleSchedule}
                            isSaving={isSaving}
                        />
                    </div>

                    {/* Right Panel (25%) */}
                    <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-gray-50/30 hidden xl:block">
                        <SocialRightPanel content={content} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Social;

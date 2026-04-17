import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wand2, Image as ImageIcon, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import { useIntegrations } from '../../../context/IntegrationContext';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import PostTypeSelector from '../components/social/PostTypeSelector';
import ScheduleSelector from '../components/social/ScheduleSelector';
import SocialPreview from '../components/social/SocialPreview';

/**
 * Guard function for social publishing
 * Uses the same logic as campaign launch guard
 */
const canPublishToSocial = (platforms, integrationState) => {
    const missing = [];

    // Facebook/Instagram require Meta integration
    if (platforms.includes('Facebook') || platforms.includes('Instagram')) {
        if (!integrationState?.meta?.connected) {
            missing.push('Meta Ads (Facebook/Instagram)');
        }
    }

    // LinkedIn requires LinkedIn integration
    if (platforms.includes('LinkedIn')) {
        if (!integrationState?.linkedin?.connected) {
            missing.push('LinkedIn');
        }
    }

    return {
        allowed: missing.length === 0,
        missing
    };
};

const SocialCreate = ({ onNavigate }) => {
    const navigate = useNavigate();
    const { addSocialPost } = useMarketing();
    const { integrations } = useIntegrations();

    // Use onNavigate prop if provided (state-based), otherwise use router
    const goTo = (tab) => onNavigate ? onNavigate(tab) : null;

    // Editor State
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState('image');
    const [scheduleMode, setScheduleMode] = useState('now');
    const [isSaving, setIsSaving] = useState(false);
    const [media, setMedia] = useState([]);
    const [publishError, setPublishError] = useState(null);
    const [isAiHelping, setIsAiHelping] = useState(false);

    // Selected platforms for this post
    const selectedPlatforms = ['Facebook', 'Instagram'];

    // Check if we can publish
    const publishCheck = canPublishToSocial(selectedPlatforms, integrations);
    const canPublish = publishCheck.allowed && content.length > 0;

    const handleDrop = (e) => {
        e.preventDefault();
        setMedia([...media, { id: Date.now(), url: '#' }]);
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        const newPost = {
            content,
            type: postType,
            status: 'draft',
            scheduledFor: null,
            platforms: selectedPlatforms
        };
        try {
            await addSocialPost(newPost);
            setContent('');
            setMedia([]);
            if (onNavigate) onNavigate('drafts');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        // STRICT GUARD: Re-check at publish time
        const check = canPublishToSocial(selectedPlatforms, integrations);

        if (!check.allowed) {
            setPublishError({
                message: `Connect ${check.missing.join(', ')} in Settings to publish posts`,
                missing: check.missing
            });
            return;
        }

        if (!content) {
            return;
        }

        setPublishError(null);
        setIsSaving(true);

        const status = scheduleMode === 'now' ? 'published' : 'scheduled';
        const newPost = {
            content,
            type: postType,
            status: status,
            scheduledFor: scheduleMode === 'now' ? null : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            platforms: selectedPlatforms
        };
        try {
            await addSocialPost(newPost);
            setContent('');
            setMedia([]);
            if (onNavigate) onNavigate(status === 'published' ? 'published' : 'scheduled');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAiAssist = async () => {
        setIsAiHelping(true);
        try {
            const prompt = content?.trim()
                ? `Improve this social post for higher engagement while keeping intent: "${content}"`
                : 'Write a short social media post for real estate lead generation with a strong CTA.';
            const res = await api.post('/ai/chat', { message: prompt });
            if (res?.response) setContent(String(res.response).trim());
        } catch (err) {
            setPublishError({ message: err?.message || 'AI assist failed. Please try again.' });
        } finally {
            setIsAiHelping(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-full pb-8 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
                <p className="text-gray-500">Compose and schedule your content across platforms.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Editor (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Integration Warning */}
                    {!publishCheck.allowed && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                                        Missing Required Integrations
                                    </h4>
                                    <p className="text-sm text-red-700 mb-3">
                                        Connect {publishCheck.missing.join(', ')} in Settings to publish posts.
                                    </p>
                                    <Link
                                        to="/settings/integrations"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Go to Marketing Settings → Integrations <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Publish Error (if user tries to publish without integrations) */}
                    {publishError && (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-amber-800 mb-2">
                                        Cannot Publish Post
                                    </h4>
                                    <p className="text-sm text-amber-700 mb-4">
                                        {publishError.message}
                                    </p>
                                    <Link
                                        to="/settings/integrations"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        Go to Integrations <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 1. Content Composition */}
                    <Card className="overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <label className="text-sm font-medium text-gray-700">Content Type</label>
                            <PostTypeSelector selectedType={postType} onSelect={setPostType} />
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Caption */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Caption <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAiAssist}
                                        disabled={isAiHelping}
                                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors disabled:opacity-60"
                                    >
                                        <Wand2 className="w-3 h-3" />
                                        {isAiHelping ? 'Generating...' : 'AI Assist'}
                                    </button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-40 p-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none placeholder-gray-400"
                                    placeholder="What's on your mind? Type @ to mention..."
                                />
                                <div className="flex gap-2 mt-2">
                                    {['#NewListing', '#RealEstate', '#DreamHome'].map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Media Upload */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Media</label>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Drag & drop photos or videos</p>
                                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, MP4 up to 50MB</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. Scheduling & Publishing */}
                    <Card>
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <label className="text-sm font-medium text-gray-700">Publishing Options</label>
                        </div>
                        <div className="p-6 space-y-6">
                            <ScheduleSelector scheduleMode={scheduleMode} onModeChange={setScheduleMode} />

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
                                    Save as Draft
                                </Button>
                                <Button
                                    onClick={handlePublish}
                                    isLoading={isSaving}
                                    disabled={!canPublish || isSaving}
                                    className={!canPublish ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none pointer-events-none' : ''}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {scheduleMode === 'now' ? 'Publish Now' : 'Schedule Post'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Preview (1 col) */}
                <div className="lg:col-span-1 sticky top-24">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Preview</label>
                        <span className="text-xs text-gray-400">Updates automatically</span>
                    </div>
                    <SocialPreview content={content} />

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <p className="font-medium mb-1">💡 Pro Tip</p>
                        <p className="opacity-90">Adding a location tag can increase engagement by up to 35%.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialCreate;

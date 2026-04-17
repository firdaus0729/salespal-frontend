import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Send, Copy, XCircle } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import SocialPreview from '../components/social/SocialPreview';

const SocialPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { socialPosts, deleteSocialPost, updateSocialPost, addSocialPost } = useMarketing();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const found = socialPosts.find(p => p.id === id);
        setPost(found);
    }, [id, socialPosts]);

    if (!post) return <div className="p-8 text-center text-gray-500">Loading post...</div>;

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post?')) {
            deleteSocialPost(post.id);
            navigate('/marketing/social');
        }
    };

    const handleDuplicate = () => {
        const newPost = {
            ...post,
            id: Date.now().toString(),
            status: 'draft',
            timestamp: new Date().toISOString(),
            scheduledFor: null
        };
        addSocialPost(newPost);
        navigate(`/marketing/social/create?edit=${newPost.id}`);
    };

    const handleCancelSchedule = () => {
        if (confirm('Cancel scheduling and move back to drafts?')) {
            updateSocialPost(post.id, { status: 'draft', scheduledFor: null });
            navigate('/marketing/social/drafts');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
                        <Badge>{post.status}</Badge>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created on {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Draft Actions */}
                    {post.status === 'draft' && (
                        <>
                            <Button variant="secondary" onClick={() => navigate(`/marketing/social/create?edit=${post.id}`)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Draft
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </>
                    )}

                    {/* Scheduled Actions */}
                    {post.status === 'scheduled' && (
                        <>
                            <Button variant="secondary" onClick={() => navigate(`/marketing/social/create?edit=${post.id}`)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="secondary" onClick={handleCancelSchedule} className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100">
                                <XCircle className="w-4 h-4 mr-2" /> Cancel Schedule
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </>
                    )}

                    {/* Published Actions */}
                    {post.status === 'published' && (
                        <>
                            <Button variant="secondary" onClick={handleDuplicate}>
                                <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </Button>
                            {/* Typically don't delete published posts, but keeping option */}
                            <Button variant="ghost" onClick={handleDelete} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">Content</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>
                </Card>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                    <SocialPreview content={post.content} />
                </div>
            </div>
        </div>
    );
};

export default SocialPostDetails;

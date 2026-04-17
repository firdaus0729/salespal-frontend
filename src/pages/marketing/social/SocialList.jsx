import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Calendar, FileText, Send, MoreHorizontal, Edit2, XCircle, Copy, BarChart2 } from 'lucide-react';
import { useMarketing } from '../../../context/MarketingContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const SocialList = ({ status, onNavigate }) => {
    const navigate = useNavigate();
    const { socialPosts, deleteSocialPost, updateSocialPost, addSocialPost } = useMarketing();

    // Use onNavigate prop if provided (state-based), otherwise use router
    const goTo = (tab) => onNavigate ? onNavigate(tab) : navigate(`/marketing/social/${tab}`);

    const posts = socialPosts.filter(p => {
        if (status === 'drafts') return p.status === 'draft' || !p.status;
        return p.status === status;
    });

    const getStatusIcon = () => {
        switch (status) {
            case 'drafts': return FileText;
            case 'scheduled': return Calendar;
            case 'published': return Send;
            default: return FileText;
        }
    };

    const StatusIcon = getStatusIcon();

    const handleDuplicate = (post) => {
        const newPost = {
            ...post,
            id: Date.now().toString(),
            status: 'draft',
            timestamp: new Date().toISOString(),
            scheduledFor: null
        };
        addSocialPost(newPost);
        goTo('drafts');
    };

    const handleCancelSchedule = (post) => {
        if (confirm('Cancel scheduling and move back to drafts?')) {
            updateSocialPost(post.id, { status: 'draft', scheduledFor: null });
        }
    };

    const renderActions = (post) => {
        switch (status) {
            case 'drafts':
                return (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goTo('create')}
                            className="text-gray-500 hover:text-primary"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (confirm('Delete this draft?')) deleteSocialPost(post.id);
                            }}
                            className="text-gray-500 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </>
                );
            case 'scheduled':
                return (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goTo('create')}
                            className="text-gray-500 hover:text-primary"
                            title="Edit Post"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelSchedule(post)}
                            className="text-gray-500 hover:text-orange-600"
                            title="Cancel Schedule"
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </>
                );
            case 'published':
                return (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/marketing/social/posts/${post.id}`)}
                            className="text-gray-500 hover:text-primary"
                            title="View Analytics"
                        >
                            <BarChart2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(post)}
                            className="text-gray-500 hover:text-primary"
                            title="Duplicate"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{status}</h2>
                    <p className="text-gray-500 mt-1">Manage your {status} posts</p>
                </div>
                {status !== 'published' && (
                    <Button onClick={() => goTo('create')}>Create New</Button>
                )}
            </div>

            {posts.length === 0 ? (
                <Card className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 mx-auto">
                        <StatusIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500 max-w-sm mb-6">There are no posts in this list yet.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {posts.map(post => (
                        <Card key={post.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                            {/* Preview Thumbnail (Mock) */}
                            <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                                {post.type === 'image' ? '🖼️' : '🎥'}
                            </div>

                            <div className="flex-1 py-1">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <Badge variant={status === 'published' ? 'success' : status === 'scheduled' ? 'warning' : 'default'} className="mb-2 uppercase text-xs tracking-wider">
                                            {status}
                                        </Badge>
                                        <h3 className="font-medium text-gray-900 line-clamp-2">{post.content || 'Untitled Post'}</h3>
                                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(post.timestamp).toDateString()}
                                            </span>
                                            <div className="flex gap-1">
                                                {post.platforms?.map(p => (
                                                    <span key={p} className="w-2 h-2 rounded-full bg-gray-300" title={p}></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {renderActions(post)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SocialList;

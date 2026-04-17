import React, { useState } from 'react';
import {
    MessageCircle, Heart, Share2, BarChart2,
    MoreHorizontal, Send, User, ThumbsUp,
    Search, Filter, ArrowUpRight
} from 'lucide-react';
import { Facebook, Linkedin, Twitter, Instagram } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Badge from '../../../../components/ui/Badge';

// Mock Data Generators
const MOCK_COMMENTS = [
    {
        id: 'c1',
        author: 'Sarah Jenkins',
        avatar: null,
        role: 'Marketing Director',
        text: 'This is exactly what we needed! Great insights on the SaaS growth metrics.',
        time: '2h ago',
        replies: []
    },
    {
        id: 'c2',
        author: 'David Chen',
        avatar: null,
        role: 'Product Owner',
        text: 'Could you elaborate more on the customer retention strategies mentioned in slide 3?',
        time: '5h ago',
        replies: [
            {
                id: 'r1',
                author: 'You',
                text: 'Hi David! We largely focus on proactive support and regular value reviews. I can DM you a case study.',
                time: '1h ago'
            }
        ]
    },
    {
        id: 'c3',
        author: 'Priya Sharma',
        avatar: null,
        role: 'Founder',
        text: 'Love the new design update! 😍',
        time: '1d ago',
        replies: []
    }
];

const PLATFORM_ICONS = {
    'Facebook': <Facebook className="w-4 h-4 text-blue-600" />,
    'LinkedIn': <Linkedin className="w-4 h-4 text-[#0077B5]" />,
    'Twitter': <Twitter className="w-4 h-4 text-sky-500" />,
    'Instagram': <Instagram className="w-4 h-4 text-pink-600" />
};

const SocialEngagementDashboard = ({ posts }) => {
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [activeReplyId, setActiveReplyId] = useState(null);

    // Filter only published posts and add mock stats if missing
    // Memoize to prevent random numbers changing on re-renders (like typing in reply box)
    const engagementPosts = React.useMemo(() => {
        return posts
            .filter(p => p.status === 'published')
            .map(p => ({
                ...p,
                metrics: p.metrics || {
                    likes: Math.floor(Math.random() * 150) + 10,
                    comments: Math.floor(Math.random() * 20) + 2,
                    shares: Math.floor(Math.random() * 30),
                    reach: Math.floor(Math.random() * 5000) + 500
                },
                comments: p.comments || MOCK_COMMENTS
            }));
    }, [posts]);

    const selectedPost = engagementPosts.find(p => p.id === selectedPostId) || engagementPosts[0];

    const handleSendReply = (commentId) => {
        if (!replyText.trim()) return;

        // In a real app, this would modify the stored state
        console.log(`Replying to ${commentId}: ${replyText}`);
        setReplyText('');
        setActiveReplyId(null);
        alert("Reply posted! (Mock)");
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-8 bg-gray-50">
            {/* LEFT: Post Feed (40%) */}
            <div className="w-5/12 border-r border-gray-200 bg-white flex flex-col z-10">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Post Engagement</h2>
                        <p className="text-xs text-gray-500">Manage interactions across all platforms</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {engagementPosts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No published posts yet correctly.
                        </div>
                    ) : (
                        engagementPosts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => setSelectedPostId(post.id)}
                                className={`
                                    group relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md
                                    ${selectedPostId === post.id ? 'border-primary ring-1 ring-primary/10 shadow-sm' : 'border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                {/* New Activity Badge (Mock) */}
                                {Math.random() > 0.7 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse z-10">
                                        3 new
                                    </span>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-1">
                                            {post.platforms?.map(p => (
                                                <div key={p} className="w-6 h-6 rounded-full bg-gray-50 border border-white flex items-center justify-center shadow-sm">
                                                    {PLATFORM_ICONS[p] || <Share2 className="w-3 h-3 text-gray-400" />}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    {/* Thumbnail (if image) */}
                                    {post.type === 'image' && (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-100">
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <span className="text-xl">🖼️</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-800 line-clamp-2 mb-3 leading-relaxed">
                                            {post.content}
                                        </p>

                                        {/* Metrics Row */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="Likes">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                <span className="font-semibold">{post.metrics.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-full" title="Comments">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>{post.metrics.comments}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors" title="Shares">
                                                <Share2 className="w-3.5 h-3.5" />
                                                <span className="font-semibold">{post.metrics.shares}</span>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1.5 text-gray-400" title="Reach">
                                                <BarChart2 className="w-3.5 h-3.5" />
                                                <span>{(post.metrics.reach / 1000).toFixed(1)}k</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Engagement Detail (60%) */}
            <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden relative">
                {selectedPost ? (
                    <>
                        {/* Header */}
                        <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-gray-900 font-bold mb-1">Engagement Details</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>Posted on {new Date(selectedPost.timestamp).toLocaleString()}</span>
                                        <span>•</span>
                                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                                            View live post <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Reach</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedPost.metrics.reach.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white border border-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Reactions</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedPost.metrics.likes.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white border border-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Comments</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedPost.metrics.comments.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white border border-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Shares</div>
                                    <div className="text-2xl font-bold text-gray-900">{selectedPost.metrics.shares.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Comments Feed */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {selectedPost.comments.map(comment => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-white">
                                        {comment.author.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-gray-900 text-sm">{comment.author}</span>
                                                    {comment.role && <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{comment.role}</span>}
                                                </div>
                                                <span className="text-xs text-gray-400">{comment.time}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>

                                            <div className="mt-3 flex gap-4 text-xs font-medium text-gray-500">
                                                <button className="hover:text-blue-600 transition-colors">Like</button>
                                                <button
                                                    className="hover:text-blue-600 transition-colors"
                                                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {comment.replies && comment.replies.map(reply => (
                                            <div key={reply.id} className="mt-3 ml-12 flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                    You
                                                </div>
                                                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex-1">
                                                    <p className="text-gray-800 text-sm">{reply.text}</p>
                                                    <span className="text-xs text-gray-400 mt-1 block">{reply.time}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Reply Box */}
                                        {activeReplyId === comment.id && (
                                            <div className="mt-4 ml-2 animate-fade-in-up">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                        You
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            className="w-full p-3 pr-10 rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                            placeholder={`Reply to ${comment.author}...`}
                                                            rows={2}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSendReply(comment.id)}
                                                            className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!replyText.trim()}
                                                        >
                                                            <Send className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Blank state if no comments */}
                            {selectedPost.comments.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h4 className="text-gray-900 font-medium mb-1">No engagement yet</h4>
                                    <p className="text-gray-500 text-sm">Be the first to comment on this post!</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <BarChart2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium">Select a post to view engagement details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialEngagementDashboard;

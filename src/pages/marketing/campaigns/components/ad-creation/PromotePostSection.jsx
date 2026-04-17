import React, { useState } from 'react';
import { Instagram, Facebook, Calendar, ArrowRight, Heart, MessageCircle, Eye } from 'lucide-react';
import Button from '../../../../../components/ui/Button';

// Mock Data for Social Posts
const MOCK_POSTS = [
    {
        id: 1,
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
        caption: 'Just listed! Stunning sea-facing apartment in South Mumbai. DM for details.',
        stats: { likes: 124, comments: 12, views: 450 },
        date: '2 Oct 2024'
    },
    {
        id: 2,
        platform: 'facebook',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        caption: 'Our latest project "The Horizon" is now open for bookings. Visit our site office today.',
        stats: { likes: 89, comments: 45, views: 1200 },
        date: '28 Sep 2024'
    },
    {
        id: 3,
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
        caption: 'Modern amenities for a modern lifestyle. #LuxuryLiving #MumbaiRealEstate',
        stats: { likes: 256, comments: 34, views: 890 },
        date: '15 Sep 2024'
    }
];

const PromotePostSection = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                            <Instagram className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Promote Your Existing Post</h4>
                            <p className="text-sm text-gray-600">Turn your social post into an ad instantly and save creative credits.</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="group-hover:translate-x-1 transition-transform">
                        Promote Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 border-t border-gray-100 pt-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Select a Post to Promote</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    Cancel
                </button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                {MOCK_POSTS.map((post) => (
                    <div
                        key={post.id}
                        onClick={() => onSelect(post)}
                        className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                        <div className="relative aspect-square">
                            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm">
                                {post.platform === 'instagram' ?
                                    <Instagram className="w-4 h-4 text-pink-600" /> :
                                    <Facebook className="w-4 h-4 text-blue-600" />
                                }
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {post.date}
                            </p>
                            <p className="text-sm text-gray-800 line-clamp-2 mb-3 h-10">
                                {post.caption}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.stats.likes}</span>
                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.stats.comments}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.stats.views}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotePostSection;

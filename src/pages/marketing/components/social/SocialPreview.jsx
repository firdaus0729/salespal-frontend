import React from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal } from 'lucide-react';

const SocialPreview = ({ content, image }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-sm mx-auto shadow-sm">
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        LP
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-gray-900 block leading-tight">Luxury Properties</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">Sponsored</span>
                    </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>

            {/* Media Placeholder */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative group overflow-hidden">
                <img
                    src="https://source.unsplash.com/random/400x400?luxury,house"
                    alt="Post Preview"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-black/75 text-white text-xs px-2 py-1 rounded">Media Preview</span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-gray-800" />
                    <MessageCircle className="w-5 h-5 text-gray-800" />
                    <Send className="w-5 h-5 text-gray-800" />
                </div>
                {/* Save Icon Mock */}
                <div className="w-5 h-5 border-gray-800 border-2 rounded-sm" style={{ borderTop: 0, borderRight: 0, transform: 'rotate(-45deg)' }}></div>
            </div>

            {/* Caption */}
            <div className="px-3 pb-3">
                <p className="text-sm text-gray-900 font-semibold mb-1">245 likes</p>
                <div className="text-sm text-gray-800">
                    <span className="font-semibold mr-1">Luxury Properties</span>
                    {content || (
                        <span className="text-gray-400 italic">Your caption will appear here...</span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1 uppercase">2 hours ago</p>
            </div>
        </div>
    );
};

export default SocialPreview;

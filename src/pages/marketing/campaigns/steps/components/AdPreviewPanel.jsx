import React, { useState, useMemo } from 'react';
import {
    Monitor, Smartphone, Heart, MessageCircle, Send,
    MoreHorizontal, ThumbsUp, Share2, Bookmark,
    Search, ChevronDown, Globe, Wifi, Battery, Signal,
    CheckCheck, Phone, Image as ImageIcon, Video, Layers,
    ExternalLink, Eye, RefreshCw, Facebook, Instagram
} from 'lucide-react';

// ─── Tiny icon helpers ────────────────────────────────────────────────────────
const MetaBadge = () => (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="#1877F2">
        <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987H5.898V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10c0-5.523-4.477-10-10-10z" />
    </svg>
);
const GoogleBadge = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
const WhatsAppBadge = () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

// ─── Preview Tab Config ───────────────────────────────────────────────────────
const PREVIEW_TABS = [
    { id: 'social', label: 'Social', icon: MetaBadge },
    { id: 'google', label: 'Search', icon: GoogleBadge },
    { id: 'whatsapp', label: 'WhatsApp', icon: WhatsAppBadge },
    { id: 'sms', label: 'SMS/RCS', icon: null },
    { id: 'display', label: 'Display', icon: null },
];

// ─── Phone shell ─────────────────────────────────────────────────────────────
const PhoneShell = ({ children }) => (
    <div className="relative mx-auto" style={{ width: 280 }}>
        {/* Phone frame */}
        <div className="rounded-[36px] border-[8px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="bg-black h-6 flex items-center justify-center relative">
                <div className="w-16 h-3.5 bg-gray-900 rounded-full" />
                <div className="absolute left-4 flex items-center gap-1">
                    <Signal className="w-3 h-3 text-white/70" />
                    <Wifi className="w-3 h-3 text-white/70" />
                </div>
                <div className="absolute right-4 flex items-center gap-1">
                    <span className="text-[9px] text-white/70 font-medium">3:14</span>
                    <Battery className="w-3 h-3 text-white/70" />
                </div>
            </div>
            {/* Content */}
            <div className="bg-white overflow-y-auto" style={{ maxHeight: 480 }}>
                {children}
            </div>
        </div>
    </div>
);

// ─── Desktop shell ────────────────────────────────────────────────────────────
const DesktopShell = ({ children }) => (
    <div className="mx-auto" style={{ maxWidth: 480 }}>
        {/* Browser chrome */}
        <div className="rounded-t-xl border border-b-0 border-gray-200 bg-gray-100 p-2 flex items-center gap-2">
            <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 flex items-center gap-2 border border-gray-200">
                <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-[10px] text-gray-500 truncate">www.example.com</span>
            </div>
            <RefreshCw className="w-3 h-3 text-gray-400" />
        </div>
        {/* Content area */}
        <div className="border border-gray-200 rounded-b-xl overflow-hidden bg-white">
            {children}
        </div>
    </div>
);

// ─── SOCIAL PREVIEW ───────────────────────────────────────────────────────────
const SocialFeedPreview = ({ copy, uploadedMedia, format, previewMode, promotedPost }) => (
    <div className="text-[13px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${promotedPost?.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    YB
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-xs leading-tight">Your Business</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className="bg-blue-100 text-blue-700 font-bold px-1 rounded text-[8px]">Sponsored</span>
                        · {promotedPost?.platform === 'instagram' ? <Instagram className="w-2.5 h-2.5" /> : promotedPost?.platform === 'facebook' ? <Facebook className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                    </p>
                </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Primary text */}
        <div className="px-3 py-2 text-[11px] text-gray-800 leading-relaxed">
            {copy.primaryText
                ? <p className="line-clamp-3">{copy.primaryText}</p>
                : <p className="text-gray-300 italic">Your ad text will appear here...</p>
            }
        </div>

        {/* Media block */}
        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative ${format === 'carousel' ? 'aspect-[4/3]' : 'aspect-square'}`}>
            {uploadedMedia ? (
                uploadedMedia.type === 'video'
                    ? <video src={uploadedMedia.url} className="w-full h-full object-cover" />
                    : <img src={uploadedMedia.url} className="w-full h-full object-cover" alt="Ad" />
            ) : (
                <div className="w-full h-full relative group">
                    {format === 'carousel' ? (
                        <div className="flex w-full h-full overflow-x-auto snap-x scrollbar-hide">
                            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover shrink-0 snap-center" alt="Sample 1" />
                            <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover shrink-0 snap-center" alt="Sample 2" />
                            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover shrink-0 snap-center" alt="Sample 3" />
                        </div>
                    ) : (
                        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Sample" />
                    )}
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                        <span className="bg-black/40 text-white text-[10px] font-medium px-2 py-1 flex items-center gap-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-3 h-3" /> Sample Creative
                        </span>
                    </div>
                </div>
            )}

            {/* Carousel dots */}
            {format === 'carousel' && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`rounded-full ${i === 0 ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
                    ))}
                </div>
            )}
        </div>

        {/* CTA bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
            <div className="min-w-0 flex-1 mr-3">
                <p className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">yoursite.com</p>
                <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-1">
                    {copy.headline || 'Your Headline Here'}
                </p>
            </div>
            <button className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-md whitespace-nowrap">
                {copy.cta || 'Learn More'}
            </button>
        </div>

        {/* Engagement bar */}
        <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-500">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="text-[10px]">Like</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">Comment</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500">
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[10px]">Share</span>
            </button>
        </div>
    </div>
);

// ─── GOOGLE SEARCH PREVIEW ────────────────────────────────────────────────────
const GoogleSearchPreview = ({ copy, desktop }) => (
    <div className="p-4 font-sans">
        {/* Google bar */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <GoogleBadge />
            <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 flex items-center gap-2">
                <Search className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] text-gray-600 truncate">{copy.headline || 'luxury apartments mumbai'}</span>
            </div>
        </div>

        {/* Sponsored label */}
        <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[9px] border border-gray-400 text-gray-500 px-1 py-0.5 rounded font-medium">Sponsored</span>
        </div>

        {/* Ad unit */}
        <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                    <Globe className="w-2.5 h-2.5 text-orange-600" />
                </div>
                <span className="text-[10px] text-gray-600">yoursite.com</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <a href="#" className="text-blue-700 text-sm font-medium leading-snug hover:underline block mb-1">
                {copy.headline || 'Luxury Properties — Sea-Facing Apartments'}
            </a>
            <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                {copy.primaryText || 'Experience world-class amenities. Book a site visit today. Limited units available. Register now.'}
            </p>

            {/* Ad extensions */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {['Call Now', 'Book Tour', 'View Floor Plans', copy.cta || 'Learn More'].map(ext => (
                    <a key={ext} href="#" className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5">
                        {ext} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                ))}
            </div>
        </div>

        {/* Organic results ghost */}
        <div className="space-y-3 opacity-30 pointer-events-none select-none">
            {[1, 2].map(i => (
                <div key={i}>
                    <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                    <div className="h-3.5 w-40 bg-gray-300 rounded mb-1" />
                    <div className="h-2.5 w-full bg-gray-200 rounded mb-0.5" />
                    <div className="h-2.5 w-3/4 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    </div>
);

// ─── WHATSAPP PREVIEW ─────────────────────────────────────────────────────────
const WhatsAppPreview = ({ copy, uploadedMedia }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="flex flex-col h-full" style={{ background: '#ECE5DD' }}>
            {/* Header */}
            <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-xs font-bold">YB</div>
                <div className="flex-1">
                    <p className="text-xs font-semibold">Your Business</p>
                    <p className="text-[9px] text-green-200">Business Account · Verified</p>
                </div>
                <Phone className="w-4 h-4 text-white/80" />
                <MoreHorizontal className="w-4 h-4 text-white/80" />
            </div>

            {/* Chat area */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {/* Date separator */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-300/60" />
                    <span className="text-[9px] text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">Today</span>
                    <div className="flex-1 h-px bg-gray-300/60" />
                </div>

                {/* Business message bubble */}
                <div className="flex justify-start">
                    <div className="max-w-[85%] bg-white rounded-xl rounded-tl-sm shadow-sm overflow-hidden">
                        {/* Header image */}
                        {uploadedMedia ? (
                            <div className="w-full bg-gray-200">
                                {uploadedMedia.type === 'video'
                                    ? <video src={uploadedMedia.url} className="w-full object-cover max-h-32" />
                                    : <img src={uploadedMedia.url} className="w-full object-cover max-h-32" alt="Ad" />
                                }
                            </div>
                        ) : (
                            <div className="w-full h-32 relative group">
                                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Sample" />
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                    <span className="bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Sample</span>
                                </div>
                            </div>
                        )}

                        <div className="p-2.5">
                            {/* Business header */}
                            <p className="text-[10px] font-bold text-[#075E54] mb-0.5">Your Business</p>
                            {/* Body */}
                            <p className="text-[11px] text-gray-800 leading-relaxed mb-2">
                                {copy.primaryText
                                    ? copy.primaryText.slice(0, 200) + (copy.primaryText.length > 200 ? '…' : '')
                                    : 'Your WhatsApp marketing message will appear here. Users receive this as a business message.'}
                            </p>
                            {/* Footer */}
                            <p className="text-[9px] text-gray-400 mb-2">{copy.headline || 'Visit us for exclusive offers'}</p>
                            {/* CTA button */}
                            <button className="w-full border-t border-gray-100 pt-2 text-[11px] font-semibold text-[#25D366] flex items-center justify-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {copy.cta || 'Learn More'}
                            </button>
                        </div>

                        <div className="px-2.5 pb-1.5 flex justify-end">
                            <span className="text-[8px] text-gray-400 flex items-center gap-0.5">
                                {timeStr} <CheckCheck className="w-2.5 h-2.5 text-blue-400" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reply prompt */}
                <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm shadow-sm px-2.5 py-2 max-w-[70%]">
                        <p className="text-[10px] text-gray-600 italic">Interested! Tell me more. 👍</p>
                        <span className="text-[8px] text-gray-400 float-right mt-0.5">{timeStr}</span>
                    </div>
                </div>
            </div>

            {/* Input bar */}
            <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2 shrink-0">
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400">Message</div>
                <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-white" />
                </div>
            </div>
        </div>
    );
};

// ─── SMS / RCS PREVIEW ────────────────────────────────────────────────────────
const SMSPreview = ({ copy, uploadedMedia, isRCS }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Messages header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-gray-900">Your Business</p>
                <p className="text-[10px] text-blue-600">{isRCS ? 'Verified Business · RCS' : 'SMS Marketing'}</p>
            </div>

            {/* Bubble area */}
            <div className="flex-1 p-4 space-y-3">
                <p className="text-[9px] text-gray-400 text-center">{timeStr}</p>

                {/* Business bubble */}
                <div className="flex items-end gap-2">
                    {isRCS && (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-blue-600">YB</span>
                        </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl rounded-tl-md p-3 shadow-sm ${isRCS ? 'bg-white border border-gray-200' : 'bg-gray-200'}`}>
                        {/* RCS rich card */}
                        {isRCS && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-100">
                                {uploadedMedia ? (
                                    <img src={uploadedMedia.url} className="w-full h-20 object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-20 relative group">
                                        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Sample" />
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Sample</span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-900 mb-0.5">{copy.headline || 'Exclusive Offer'}</p>
                                    <p className="text-[9px] text-gray-500 line-clamp-2">{copy.primaryText || 'Check out this amazing deal just for you.'}</p>
                                </div>
                            </div>
                        )}

                        <p className="text-[11px] text-gray-800 leading-relaxed">
                            {!isRCS
                                ? `${copy.primaryText?.slice(0, 140) || 'Your SMS/promotional message will appear here. Keep it concise and actionable.'}\n\nReply STOP to opt out.`
                                : copy.primaryText?.slice(0, 80) || 'Tap to explore the offer.'
                            }
                        </p>

                        {/* RCS quick-reply chips */}
                        {isRCS && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                                <button className="rounded-full border border-blue-400 text-blue-600 text-[9px] font-medium px-2.5 py-1">
                                    {copy.cta || 'Learn More'}
                                </button>
                                <button className="rounded-full border border-gray-300 text-gray-600 text-[9px] font-medium px-2.5 py-1">
                                    Call Us
                                </button>
                                <button className="rounded-full border border-gray-300 text-gray-600 text-[9px] font-medium px-2.5 py-1">
                                    Stop
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isRCS && (
                    <p className="text-[8px] text-gray-400 ml-8">Delivered · {timeStr}</p>
                )}
            </div>

            {/* SMS input */}
            <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-[10px] text-gray-400">
                    {isRCS ? 'Reply...' : 'Text Message'}
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Send className="w-3 h-3 text-white" />
                </div>
            </div>
        </div>
    );
};

// ─── DISPLAY AD PREVIEW ───────────────────────────────────────────────────────
const DisplayAdPreview = ({ copy, uploadedMedia, desktop }) => (
    <div className={`${desktop ? 'p-4' : 'p-3'} bg-gray-50 min-h-full`}>
        {/* Page mockup */}
        <div className="space-y-1.5 mb-3 opacity-30 pointer-events-none select-none">
            <div className="h-2 bg-gray-400 rounded w-3/4" />
            <div className="h-2 bg-gray-300 rounded w-full" />
            <div className="h-2 bg-gray-300 rounded w-5/6" />
            <div className="h-2 bg-gray-300 rounded w-full" />
            <div className="h-2 bg-gray-300 rounded w-2/3" />
        </div>

        {/* Banner ad */}
        <div className={`border border-gray-300 rounded-lg overflow-hidden shadow-md mx-auto bg-white ${desktop ? 'max-w-sm' : 'max-w-full'}`}>
            {/* Ad label */}
            <div className="bg-yellow-50 border-b border-yellow-200 px-2 py-0.5 flex items-center gap-1">
                <span className="text-[8px] font-bold text-yellow-700 uppercase tracking-wider">Ad</span>
                <GoogleBadge />
                <span className="text-[8px] text-gray-400">Google Display</span>
            </div>

            {/* Creative */}
            <div className="relative">
                {uploadedMedia ? (
                    <div className="w-full h-32 overflow-hidden">
                        {uploadedMedia.type === 'video'
                            ? <video src={uploadedMedia.url} className="w-full h-full object-cover" />
                            : <img src={uploadedMedia.url} className="w-full h-full object-cover" alt="Ad" />
                        }
                    </div>
                ) : (
                    <div className="w-full h-32 relative group">
                        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Sample Display Ad" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end p-4 text-center">
                            <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">
                                {copy.headline || 'Your Headline'}
                            </p>
                            <p className="text-gray-200 text-[10px] line-clamp-1 mb-2">
                                {copy.primaryText?.slice(0, 60) || 'Descriptive subtext will appear here'}
                            </p>
                            <button className="bg-white text-gray-900 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg">
                                {copy.cta || 'Learn More'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Text row for non-image mode */}
            {uploadedMedia && (
                <div className="flex items-center justify-between p-2 border-t border-gray-100 bg-gray-50">
                    <div className="flex-1 min-w-0 mr-2">
                        <p className="text-[9px] text-gray-400 truncate">yoursite.com</p>
                        <p className="text-[10px] font-bold text-gray-900 leading-tight truncate">{copy.headline || 'Your Headline'}</p>
                    </div>
                    <button className="shrink-0 bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md">
                        {copy.cta || 'Visit'}
                    </button>
                </div>
            )}
        </div>

        {/* Page content below ad */}
        <div className="space-y-1.5 mt-3 opacity-20 pointer-events-none select-none">
            <div className="h-2 bg-gray-400 rounded w-full" />
            <div className="h-2 bg-gray-300 rounded w-4/5" />
            <div className="h-2 bg-gray-300 rounded w-full" />
            <div className="h-2 bg-gray-300 rounded w-3/5" />
        </div>
    </div>
);

// ─── Tab Toggle ───────────────────────────────────────────────────────────────
const TabButton = ({ tab, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${isActive
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
    >
        {tab.icon && <tab.icon />}
        {tab.label}
    </button>
);

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
const AdPreviewPanel = ({ copy, uploadedMedia, format, previewMode, selectedPlatforms, promotedPost }) => {
    const [activeTab, setActiveTab] = useState('social');
    const [device, setDevice] = useState('mobile');
    const [rcsMode, setRcsMode] = useState(false);

    // Determine which tabs to show based on selected platforms
    const availableTabs = useMemo(() => {
        return PREVIEW_TABS.filter(tab => {
            if (tab.id === 'social') return !selectedPlatforms || selectedPlatforms.includes('meta') || selectedPlatforms.includes('instagram');
            if (tab.id === 'google') return !selectedPlatforms || selectedPlatforms.includes('google');
            if (tab.id === 'display') return !selectedPlatforms || selectedPlatforms.includes('google') || selectedPlatforms.includes('youtube');
            return true; // whatsapp, sms always visible
        });
    }, [selectedPlatforms]);

    // Auto-switch to first available tab
    const currentTab = availableTabs.find(t => t.id === activeTab) ? activeTab : availableTabs[0]?.id;
    const desktop = device === 'desktop';

    // Derive the media to show (either user uploaded or selected from promoted post)
    const activeMedia = useMemo(() => {
        if (uploadedMedia) return uploadedMedia;
        if (promotedPost?.image) return { type: 'image', url: promotedPost.image };
        return null;
    }, [uploadedMedia, promotedPost]);

    const renderPreview = () => {
        switch (currentTab) {
            case 'social': return <SocialFeedPreview copy={copy} uploadedMedia={activeMedia} format={format} previewMode={previewMode} promotedPost={promotedPost} />;
            case 'google': return <GoogleSearchPreview copy={copy} desktop={desktop} />;
            case 'whatsapp': return <WhatsAppPreview copy={copy} uploadedMedia={activeMedia} />;
            case 'sms': return <SMSPreview copy={copy} uploadedMedia={activeMedia} isRCS={rcsMode} />;
            case 'display': return <DisplayAdPreview copy={copy} uploadedMedia={activeMedia} desktop={desktop} />;
            default: return null;
        }
    };

    const showDeviceToggle = ['social', 'google', 'display'].includes(currentTab);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* ── Toolbar ── */}
            <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
                {/* Tab bar */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {availableTabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            tab={tab}
                            isActive={currentTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Live Preview</span>
                        {previewMode !== 'demo' && (
                            <span className="ml-1 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                {previewMode}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* RCS toggle for SMS tab */}
                        {currentTab === 'sms' && (
                            <button
                                onClick={() => setRcsMode(r => !r)}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors ${rcsMode ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500 hover:border-blue-400'
                                    }`}
                            >
                                {rcsMode ? 'RCS' : 'SMS'}
                            </button>
                        )}

                        {/* Device toggle */}
                        {showDeviceToggle && (
                            <div className="flex items-center bg-gray-200 rounded-md p-0.5">
                                <button
                                    onClick={() => setDevice('mobile')}
                                    className={`p-1 rounded transition-colors ${device === 'mobile' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Mobile"
                                >
                                    <Smartphone className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setDevice('desktop')}
                                    className={`p-1 rounded transition-colors ${device === 'desktop' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Desktop"
                                >
                                    <Monitor className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Preview area ── */}
            <div className="flex-1 overflow-y-auto py-4 px-2" style={{ minHeight: 400 }}>
                {(desktop && showDeviceToggle) ? (
                    <DesktopShell>{renderPreview()}</DesktopShell>
                ) : (
                    (['whatsapp', 'sms'].includes(currentTab)) ? (
                        <PhoneShell>{renderPreview()}</PhoneShell>
                    ) : (
                        <div className="max-w-[320px] mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            {renderPreview()}
                        </div>
                    )
                )}
            </div>

            {/* ── Footer note ── */}
            <div className="shrink-0 px-3 py-2 border-t border-gray-100 text-center">
                <p className="text-[9px] text-gray-400">
                    Preview is for reference only. Actual ad may vary by platform.
                </p>
            </div>
        </div>
    );
};

export default AdPreviewPanel;

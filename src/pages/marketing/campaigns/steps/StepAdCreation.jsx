import React, { useState, useEffect, useMemo } from 'react';
import {
    Sparkles, CheckCircle2, Zap, Target, ArrowRight, ExternalLink,
    Facebook, Linkedin, Instagram, Loader2, RotateCcw, MousePointerClick,
    Search, Eye, Hash, Users, TrendingUp, CreditCard, Layers, Video, Image as ImageIcon,
    Heart, MessageCircle, Calendar
} from 'lucide-react';
import StepNavigation from '../components/StepNavigation';
import GeneratedCreativesPanel from '../components/GeneratedCreativesPanel';
import api from '../../../../lib/api';

// ─── Brand Icons ─────────────────────────────────────────────────────────────

const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// ─── Platform Registry ───────────────────────────────────────────────────────

const PLATFORMS = [
    { id: 'google', name: 'Google Ads', subtext: 'Search & Display', Icon: GoogleIcon, bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500', badge: 'bg-blue-100 text-blue-700' },
    { id: 'meta', name: 'Meta Ads', subtext: 'Facebook & Instagram', Icon: Facebook, bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
    { id: 'linkedin', name: 'LinkedIn', subtext: 'B2B & Professional', Icon: Linkedin, bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-500', badge: 'bg-sky-100 text-sky-700' },
    { id: 'instagram', name: 'Instagram', subtext: 'Visual Stories', Icon: Instagram, bg: 'bg-pink-50', text: 'text-pink-600', ring: 'ring-pink-500', badge: 'bg-pink-100 text-pink-700' },
];

const getPlatformMeta = (id) => PLATFORMS.find(p => p.id === id) || PLATFORMS[0];

// ─── Priority badge colors ──────────────────────────────────────────────────

const priorityStyles = {
    high: 'bg-red-50 text-red-600 border-red-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

// ─── Platform name normalizer (Gemini returns "Google Ads", we use "google") ──

function mapPlatformName(name) {
    if (!name) return 'meta';
    const lower = name.toLowerCase();
    if (lower.includes('google')) return 'google';
    if (lower.includes('meta') || lower.includes('facebook')) return 'meta';
    if (lower.includes('linkedin')) return 'linkedin';
    if (lower.includes('instagram')) return 'instagram';
    return 'meta'; // fallback
}

// ─── AI Ad Generator (local fallback) ────────────────────────────────────────

function generateAdsForCampaign(campaign, platforms, businessData) {
    const businessName = businessData?.analysisData?.businessName || businessData?.analysisData?.tags?.[0] || 'Your Business';
    const industry = businessData?.analysisData?.businessSignals?.industry || 'Business';

    return platforms.map(platformId => {
        const platform = getPlatformMeta(platformId);
        const isSearch = platformId === 'google';

        const headlines = isSearch
            ? [
                `${businessName} — ${campaign.title}`,
                `Top ${industry} Solutions | ${businessName}`,
                `Buy ${industry} Products Online`,
                `${businessName} | Trusted by Thousands`,
                `Official ${businessName} | ${campaign.type}`,
            ]
            : [
                `${campaign.title} | ${businessName}`,
                `Discover the best in ${industry}`,
                `Your next favorite from ${businessName}`,
            ];

        const descriptions = isSearch
            ? [
                `Explore premium ${industry.toLowerCase()} products at ${businessName}. Shop now and get free shipping on orders.`,
                `Trusted by 10,000+ customers. Discover what makes ${businessName} the #1 choice for ${industry.toLowerCase()}.`,
            ]
            : [
                `${campaign.description} We bring you the finest ${industry.toLowerCase()} products, designed for modern lifestyles.`,
                `Join thousands who trust ${businessName} for quality and innovation.`,
            ];

        const targeting = {
            audience: isSearch ? 'High-intent searchers' : `${industry} enthusiasts, 18–45`,
            interests: isSearch
                ? [`${industry}`, 'Online Shopping', 'Deals']
                : [`${industry}`, 'Lifestyle', 'Shopping', 'Trending'],
            keywords: isSearch
                ? [`buy ${industry.toLowerCase()} online`, `best ${industry.toLowerCase()}`, `${businessName.toLowerCase()} products`, `${industry.toLowerCase()} near me`]
                : [],
        };

        const cta = isSearch ? 'Visit Website' : campaign.type === 'Social' ? 'Shop Now' : 'Learn More';

        return {
            platform: platformId,
            platformName: platform.name,
            campaignTitle: campaign.title,
            type: campaign.type,
            priority: campaign.priority,
            headlines,
            descriptions,
            targeting,
            cta,
            displayUrl: `www.${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        };
    });
}


// ═════════════════════════════════════════════════════════════════════════════
//  Google Search Ad Preview — Authentic SERP style
// ═════════════════════════════════════════════════════════════════════════════

const GoogleAdPreview = ({ ad }) => {
    // Build breadcrumb from display URL
    const urlParts = ad.displayUrl?.replace(/^www\./, '').split('/').filter(Boolean) || ['example.com'];
    const domain = urlParts[0];
    const paths = urlParts.slice(1);

    // Generate sitelink extensions from remaining headlines
    const sitelinks = ad.headlines.slice(1, 5).map((h, i) => ({
        title: h,
        desc: ad.descriptions?.[i] || ad.descriptions?.[0]?.slice(0, 60) + '...' || '',
    }));

    return (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* ── Main Ad ──────────────────────────────────────────────── */}
            <div className="p-4 pb-3">
                {/* URL row: favicon + breadcrumb + Sponsored */}
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-[26px] h-[26px] rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                        <svg className="w-[14px] h-[14px] text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[14px] text-[#202124] font-normal leading-tight truncate">{domain}</p>
                        <div className="flex items-center gap-0.5 text-[12px] text-[#4d5156] leading-tight">
                            <span className="truncate">https://{ad.displayUrl}</span>
                            {paths.length > 0 && (
                                <>
                                    <svg className="w-3 h-3 text-[#70757a] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6"/></svg>
                                    <span className="truncate">{paths.join(' › ')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sponsored label */}
                <div className="mb-1 mt-1">
                    <span className="text-[11px] font-bold text-[#202124] tracking-wide" style={{ fontSize: '11px' }}>Sponsored</span>
                </div>

                {/* Headline — Google's exact blue */}
                <h4
                    className="text-[20px] leading-[1.3] cursor-pointer mb-0.5 group"
                    style={{ color: '#1a0dab', fontWeight: 400, letterSpacing: '-0.01em' }}
                >
                    <span className="group-hover:underline">{ad.headlines[0]}</span>
                </h4>

                {/* Second headline if available */}
                {ad.headlines[1] && (
                    <h4
                        className="text-[20px] leading-[1.3] cursor-pointer mb-1 group"
                        style={{ color: '#1a0dab', fontWeight: 400, letterSpacing: '-0.01em' }}
                    >
                        <span className="group-hover:underline">{ad.headlines[1]}</span>
                    </h4>
                )}

                {/* Description */}
                <p className="text-[14px] leading-[1.58] line-clamp-2 mt-0.5" style={{ color: '#4d5156' }}>
                    {ad.descriptions[0]}
                </p>
                {ad.descriptions[1] && (
                    <p className="text-[14px] leading-[1.58] line-clamp-1 mt-0.5" style={{ color: '#4d5156' }}>
                        {ad.descriptions[1]}
                    </p>
                )}
            </div>

            {/* ── Sitelink Extensions ──────────────────────────────────── */}
            {sitelinks.length >= 2 && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {sitelinks.map((link, i) => (
                            <div key={i} className="min-w-0 group cursor-pointer">
                                <p
                                    className="text-[14px] leading-snug truncate group-hover:underline"
                                    style={{ color: '#1a0dab' }}
                                >
                                    {link.title}
                                </p>
                                <p className="text-[12px] leading-snug truncate mt-0.5" style={{ color: '#4d5156' }}>
                                    {link.desc.slice(0, 55)}{link.desc.length > 55 ? '...' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// ═════════════════════════════════════════════════════════════════════════════
//  Social Ad Preview (Meta, Instagram, LinkedIn, TikTok)
// ═════════════════════════════════════════════════════════════════════════════

const SocialAdPreview = ({ ad, brandName = 'Your Brand' }) => {
    const platform = getPlatformMeta(ad.platform);
    const Icon = platform.Icon;
    const campaignName = ad.campaignName || ad.campaignTitle || 'Campaign';
    const primaryText = ad.primaryText || ad.descriptions?.[0] || '';
    const imageUrl = ad.imageUrl || ad.image || null;

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const gradients = [
        'from-indigo-100 via-purple-50 to-pink-100',
        'from-blue-100 via-sky-50 to-cyan-100',
        'from-amber-100 via-orange-50 to-rose-100',
    ];
    const gradient = gradients[(campaignName).length % gradients.length];

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-sans">
            {/* Post header */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100">
                <div className={`w-8 h-8 rounded-full ${platform.bg} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[12px] font-semibold text-gray-900 leading-tight">{campaignName}</p>
                    <p className="text-[10px] text-gray-400">Sponsored · {platform.name}</p>
                </div>
            </div>

            {/* Primary text */}
            <div className="px-3.5 py-2">
                <p className="text-[13px] text-gray-800 leading-relaxed line-clamp-3">
                    {primaryText}
                </p>
            </div>

            {/* Ad creative image */}
            <div className="w-full aspect-square relative px-3.5 pb-2">
                {imageUrl && !imageError ? (
                    <>
                        {/* Placeholder while loading from Pollinations */}
                        {!imageLoaded && (
                            <div className={`absolute left-[14px] top-0 right-[14px] bottom-[8px] bg-linear-to-br ${gradient} flex flex-col items-center justify-center rounded-lg`}>
                                <h3 className="text-xl font-bold text-gray-800/80 mb-2 truncate px-4">{brandName}</h3>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Designing your ad creative...
                                </div>
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt="Ad creative"
                            onLoad={() => {
                                // Add a tiny delay to ensure browser paints first
                                setTimeout(() => setImageLoaded(true), 150);
                            }}
                            onError={() => setImageError(true)}
                            className={`w-full h-full object-cover rounded-lg border border-gray-100/50 ${!imageLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
                        />
                    </>
                ) : (
                    /* Fallback / Missing state */
                    <div className={`w-full h-full rounded-lg overflow-hidden bg-linear-to-br ${gradient} flex items-center justify-center relative`}>
                        <div className="text-center px-4">
                            <h3 className="text-2xl font-bold text-gray-800/80 drop-shadow-sm truncate tracking-tight">{brandName}</h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Ad Creative</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Headlines */}
            <div className="px-3.5 py-2.5 border-t border-gray-100">
                <p className="text-[13px] font-semibold text-gray-900 leading-snug mb-0.5">{ad.headlines[0]}</p>
                {ad.headlines[1] && (
                    <p className="text-[11px] text-gray-500">{ad.headlines[1]}</p>
                )}
            </div>

            {/* CTA */}
            <div className="px-3.5 pb-3">
                <button className="w-full py-2 rounded-lg bg-blue-600 text-white text-[13px] font-semibold text-center hover:bg-blue-700 transition-colors cursor-default">
                    {ad.cta || 'Learn More'}
                </button>
            </div>
        </div>
    );
};


// ═════════════════════════════════════════════════════════════════════════════
//  Single Generated Ad Card (Left details + Right preview)
// ═════════════════════════════════════════════════════════════════════════════

const GeneratedAdCard = ({ ad }) => {
    const platform = getPlatformMeta(ad.platform);
    const isGoogle = ad.platform === 'google';
    const campaignName = ad.campaignTitle || ad.campaignName || 'Campaign';
    const goal = ad.goal || '';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Campaign name header */}
            <div className="px-5 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[14px] font-medium text-gray-900">{campaignName}</h3>
                {goal && (
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {goal}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                {/* LEFT — Ad Details (40%) */}
                <div className="lg:col-span-2 p-5 space-y-4">
                    {/* Platform badge */}
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${platform.badge}`}>
                            <platform.Icon className="w-3.5 h-3.5" />
                            {platform.name}
                        </span>
                        {ad.priority && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${priorityStyles[ad.priority] || priorityStyles.medium}`}>
                                {ad.priority}
                            </span>
                        )}
                    </div>

                    {/* Headlines */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Headlines</h4>
                        <div className="space-y-1.5">
                            {ad.headlines.map((h, i) => (
                                <div key={i} className="flex items-start gap-2 text-[13px] text-gray-700 leading-snug">
                                    <span className="text-gray-300 font-mono text-[11px] mt-0.5 shrink-0">{i + 1}.</span>
                                    <span>{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Descriptions</h4>
                        <div className="space-y-2">
                            {ad.descriptions.map((d, i) => (
                                <p key={i} className="text-[12px] text-gray-500 leading-relaxed">{d}</p>
                            ))}
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="pt-3 border-t border-gray-100">
                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            Targeting
                        </h4>
                        <p className="text-[12px] text-gray-600 mb-2">{ad.targeting.audience}</p>

                        <div className="flex flex-wrap gap-1.5">
                            {ad.targeting.interests.map((interest, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                    {interest}
                                </span>
                            ))}
                        </div>

                        {isGoogle && ad.targeting.keywords?.length > 0 && (
                            <div className="mt-2.5">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Hash className="w-2.5 h-2.5" />
                                    Keywords
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ad.targeting.keywords.map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-medium border border-blue-100">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Ad Preview (60%) */}
                <div className="lg:col-span-3 p-5 bg-gray-50/50 flex items-start justify-center">
                    <div className="w-full max-w-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="w-3 h-3" />
                                Preview
                            </span>
                            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
                                AI Generated
                            </span>
                        </div>
                        {isGoogle ? <GoogleAdPreview ad={ad} /> : <SocialAdPreview ad={ad} />}
                    </div>
                </div>

            </div>
        </div>
    );
};


// ═════════════════════════════════════════════════════════════════════════════
//  EXISTING POSTS MOCK DATA
// ═════════════════════════════════════════════════════════════════════════════

const EXISTING_POSTS = [
    {
        id: 'post-1',
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
        date: '2 Oct 2024',
        text: 'Just listed! Stunning sea-facing apartment in South Mumbai. DM for details.',
        likes: 124,
        comments: 12,
        views: 450,
    },
    {
        id: 'post-2',
        platform: 'facebook',
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80',
        date: '28 Sep 2024',
        text: 'Our latest project "The Horizon" is now open for bookings. Visit our site office today.',
        likes: 89,
        comments: 45,
        views: 1200,
    },
    {
        id: 'post-3',
        platform: 'instagram',
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
        date: '15 Sep 2024',
        text: 'Modern amenities for a modern lifestyle. #LuxuryLiving #MumbaiRealEstate',
        likes: 256,
        comments: 34,
        views: 890,
    }
];

const CTA_OPTIONS = [
    { label: 'Learn More', value: 'Learn More', unsupported: [] },
    { label: 'Sign Up', value: 'Sign Up', unsupported: [] },
    { label: 'Apply Now', value: 'Apply Now', unsupported: ['meta', 'instagram'] },
    { label: 'Book Now', value: 'Book Now', unsupported: ['google'] },
    { label: 'Buy Now', value: 'Buy Now', unsupported: ['meta', 'instagram'] },
    { label: 'Call Now', value: 'Call Now', unsupported: ['meta', 'instagram'] },
    { label: 'Contact Us', value: 'Contact Us', unsupported: ['google'] },
    { label: 'Download', value: 'Download', unsupported: ['google'] },
    { label: 'Get Quote', value: 'Get Quote', unsupported: ['meta', 'instagram'] },
    { label: 'Shop Now', value: 'Shop Now', unsupported: ['google'] },
    { label: 'Visit Website', value: 'Visit Website', unsupported: ['meta', 'instagram'] },
    { label: 'WhatsApp', value: 'WhatsApp', unsupported: ['google'] },
];

// ═════════════════════════════════════════════════════════════════════════════
//  AD FORMAT RECOMMENDATIONS DATA
// ═════════════════════════════════════════════════════════════════════════════

const AD_FORMATS = {
    carousel: {
        id: 'carousel',
        label: 'Carousel Ads',
        icon: Layers,
        highlight: '~42% more leads',
        description: 'Based on similar Real Estate audience data, carousel ads generate approximately 42% more leads compared to single image or video ads.',
        cost: 2,
    },
    video: {
        id: 'video',
        label: 'Video Ads',
        icon: Video,
        highlight: '~35% higher engagement',
        description: 'Video ads show 35% higher engagement rates for property showcases with virtual tours.',
        cost: 1,
    },
    image: {
        id: 'image',
        label: 'Single Image Ads',
        icon: ImageIcon,
        highlight: 'Cost effective',
        description: 'Single image ads offer the best cost-per-click for broad awareness campaigns.',
        cost: 1,
    }
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const StepAdCreation = ({ onComplete, onUpdate, onBack, data }) => {
    // Extract AI-generated campaigns from analysis data
    const campaigns = useMemo(() => {
        return data?.analysisData?.campaignRecommendations || [
            { title: 'Search Acquisition Campaign', type: 'Search', priority: 'high', description: 'Capture high-intent search traffic with targeted Google Ads.' },
            { title: 'Social Awareness Campaign', type: 'Social', priority: 'high', description: 'Build brand awareness with engaging social media content.' },
            { title: 'Retargeting Campaign', type: 'Display', priority: 'medium', description: 'Re-engage website visitors who showed interest but didn\'t convert.' },
            { title: 'Content Marketing Push', type: 'Social', priority: 'medium', description: 'Publish thought leadership content to build organic reach.' },
        ];
    }, [data]);

    // ── State ────────────────────────────────────────────────────────────────
    const [selectedCampaigns, setSelectedCampaigns] = useState(() => {
        if (data?.adSettings?.selectedCampaigns?.length) return data.adSettings.selectedCampaigns;
        return campaigns.filter(c => c.priority === 'high').map((_, i) => i);
    });

    const [selectedPlatforms, setSelectedPlatforms] = useState(
        data?.adSettings?.platforms || ['google', 'meta']
    );

    const [isGenerating, setIsGenerating] = useState(false);
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [videoDurationSec, setVideoDurationSec] = useState(data?.adSettings?.videoDurationSec || 12);
    const [selectedAdFormat, setSelectedAdFormat] = useState('carousel');
    const [showPromotePosts, setShowPromotePosts] = useState(false);

    const [adCopy, setAdCopy] = useState(() => {
        const businessName = data?.analysisData?.businessName || data?.analysisData?.tags?.[0] || 'Your Business';
        const industry = data?.analysisData?.businessSignals?.industry || 'services';
        const capIndustry = industry ? industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase() : 'Services';

        return {
            primaryText: `Experience world-class ${industry.toLowerCase()} with ${businessName}. Discover high-quality solutions, exceptional service, and unparalleled value tailored just for you.`,
            headline: `${businessName} | Premium ${capIndustry}`,
            cta: 'Learn More'
        };
    });

    const [generatedAds, setGeneratedAds] = useState(
        data?.adSettings?.generatedAds || null
    );

    // ── Selected campaign for the "force decision" flow ────────────────────
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    // ── Image lightbox preview (stores campaign index for composited view) ──
    const [previewImage, setPreviewImage] = useState(null);

    // ── Persist state ────────────────────────────────────────────────────────
    useEffect(() => {
        if (onUpdate) {
            onUpdate({
                adSettings: {
                    selectedCampaigns,
                    platforms: selectedPlatforms,
                    campaigns: selectedCampaigns.map(i => campaigns[i]).filter(Boolean),
                    generatedAds,
                    selectedAdFormat,
                    videoDurationSec,
                }
            });
        }
    }, [selectedCampaigns, selectedPlatforms, campaigns, generatedAds, selectedAdFormat, videoDurationSec, onUpdate]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const updateCampaignField = (index, field, value) => {
        setGeneratedAds(prev => {
            if (!prev || !prev.campaigns) return prev;
            const nextCampaigns = [...prev.campaigns];
            if (field === 'headlines' || field === 'descriptions') {
                const arr = [...(nextCampaigns[index][field] || [])];
                arr[0] = value;
                nextCampaigns[index] = { ...nextCampaigns[index], [field]: arr };
            } else {
                nextCampaigns[index] = { ...nextCampaigns[index], [field]: value };
            }
            return { ...prev, campaigns: nextCampaigns };
        });
    };

    const toggleCampaign = (index) => {
        setSelectedCampaigns(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (selectedCampaigns.length === 0 || selectedPlatforms.length === 0) return;
        setIsGenerating(true);
        setSelectedCampaign(null);

        try {
            const selectedCampaignPayload = selectedCampaigns.map((i) => campaigns[i]).filter(Boolean);
            const response = await api.post('/api/marketing/generate-ads', {
                analysisData: data?.analysisData || {},
                platforms: selectedPlatforms,
                numberOfImages: numberOfImages,
                selectedCampaigns: selectedCampaignPayload,
                selectedAdFormat,
                carouselSlides: selectedAdFormat === 'carousel' || selectedAdFormat === 'video' ? 6 : undefined,
                videoDurationSec,
            });

            const payload = response?.data != null ? response.data : response;
            const apiCampaigns = payload?.campaigns || [];
            console.log('[StepAdCreation] API returned', apiCampaigns.length, 'campaigns');

            // Normalize — backend returns image / images / carouselImages
            const normalized = apiCampaigns.map((c) => {
                const imgs = (c.images && c.images.length ? c.images : null) ||
                    (c.carouselImages && c.carouselImages.length ? c.carouselImages : null) ||
                    [c.imageUrl || c.image].filter(Boolean);
                return {
                    ...c,
                    platform: mapPlatformName(c.platform),
                    campaignName: c.campaignName || c.campaignTitle || 'Campaign',
                    headlines: c.headlines || [],
                    descriptions: c.descriptions || [],
                    primaryText: c.primaryText || '',
                    targeting: {
                        audience: c.targeting?.audience || 'General audience',
                        interests: c.targeting?.interests || [],
                        keywords: c.targeting?.keywords || [],
                    },
                    imageUrl: c.imageUrl || c.image || imgs[0] || null,
                    images: imgs,
                    carouselImages: c.carouselImages?.length ? c.carouselImages : imgs,
                    activeImageIndex: 0,
                };
            });

            setGeneratedAds({ campaigns: normalized });
        } catch (error) {
            console.error('[StepAdCreation] API Error, falling back to local gen:', error);
            const selectedCampaignData = selectedCampaigns.map(i => campaigns[i]).filter(Boolean);
            const allAds = selectedCampaignData.flatMap(campaign =>
                generateAdsForCampaign(campaign, selectedPlatforms, data)
            );

            // Try to fetch real AI images even in fallback mode so the UI never shows empty creative cards.
            const adsWithImages = await Promise.all(
                allAds.map(async (ad) => {
                    const normalizedPlatform = ad.platform === 'meta' ? 'Meta Ads' : ad.platform;
                    const needsSlides = selectedAdFormat === 'carousel' || selectedAdFormat === 'video';
                    const desiredCount = needsSlides ? 6 : Math.max(1, numberOfImages);
                    const count = ad.platform === 'google' ? Math.min(desiredCount, 2) : desiredCount;
                    const images = [];

                    for (let i = 0; i < count; i++) {
                        try {
                            const imgRes = await api.post('/api/marketing/generate-ad-image', {
                                businessOverview: data?.analysisData?.businessSummary || '',
                                valueProposition: data?.analysisData?.keyDifferentiators?.join('. ') || '',
                                targetAudience: data?.analysisData?.targetAudience || '',
                                campaignName: ad.campaignTitle || ad.campaignName || 'Campaign',
                                primaryText: ad.primaryText || ad.descriptions?.[0] || '',
                                platform: normalizedPlatform,
                                industry: data?.analysisData?.businessSignals?.industry || 'Business',
                                logo: data?.analysisData?.logo || '',
                            });
                            const imgPayload = imgRes?.data != null ? imgRes.data : imgRes;
                            const imgUrl = imgPayload?.imageUrl || imgPayload?.data?.imageUrl || null;
                            if (imgUrl) images.push(imgUrl);
                        } catch (imgErr) {
                            console.warn('[StepAdCreation] fallback image generation failed for slide', i + 1, imgErr?.message || imgErr);
                        }
                    }

                    const first = images[0] || null;
                    return {
                        ...ad,
                        image: first,
                        imageUrl: first,
                        images,
                        carouselImages: images,
                        generatedAdFormat: selectedAdFormat,
                        videoFromSlides: selectedAdFormat === 'video',
                    };
                })
            );

            setGeneratedAds({ campaigns: adsWithImages });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedAds(null);
        setSelectedCampaign(null);
    };

    const handleNext = () => {
        if (onComplete && generatedAds && selectedCampaign !== null) {
            onComplete({
                adSettings: {
                    selectedCampaigns,
                    platforms: selectedPlatforms,
                    campaigns: selectedCampaigns.map(i => campaigns[i]).filter(Boolean),
                    generatedAds,
                    chosenCampaign: generatedAds.campaigns[selectedCampaign],
                    selectedAdFormat,
                    videoDurationSec,
                }
            });
        }
    };

    const canProceed = selectedCampaigns.length > 0 && selectedPlatforms.length > 0;

    const typeIcons = { Search: Target, Social: Sparkles, Display: Zap, Influencer: Instagram };

    // ═════════════════════════════════════════════════════════════════════════
    //  GENERATED MODE — selectable campaign cards
    // ═════════════════════════════════════════════════════════════════════════

    if (generatedAds) {
        const adCampaigns = generatedAds.campaigns || [];
        return (
            <>
            {/* ── Composited Ad Lightbox ── */}
            {previewImage !== null && adCampaigns[previewImage] && (() => {
                const lbCampaign = adCampaigns[previewImage];
                const lbImage = lbCampaign.imageUrl || lbCampaign.image || null;
                const lbHeadline = lbCampaign.headlines?.[0] || lbCampaign.campaignName || 'Campaign';
                const lbDesc = lbCampaign.primaryText || lbCampaign.descriptions?.[0] || lbCampaign.description || '';
                const lbPlatform = getPlatformMeta(lbCampaign.platform);
                const LbIcon = lbPlatform.Icon;
                const brandName = data?.analysisData?.businessName || 'Brand';
                const logoUrl = data?.analysisData?.logo || null;
                return (
                    <div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] backdrop-blur-md"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                            {/* Close button */}
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-10 right-0 text-white text-sm font-semibold px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition z-20"
                            >
                                ✕ Close
                            </button>

                            {/* Composited Ad Creative */}
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                {/* Background Image */}
                                {lbImage ? (
                                    <img src={lbImage} alt="Ad creative" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                                )}

                                {/* Dark gradient for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

                                {/* Logo + Brand Name (top-left) */}
                                <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/95 p-1 shadow-md" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/95 flex items-center justify-center shadow-md">
                                            <span className="text-[14px] font-black text-gray-800">{brandName.charAt(0)}</span>
                                        </div>
                                    )}
                                    <span className="text-white text-[15px] font-bold drop-shadow-lg tracking-wide">
                                        {brandName}
                                    </span>
                                </div>

                                {/* Platform badge (top-right) */}
                                <div className="absolute top-6 right-6 z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold shadow-md backdrop-blur-sm bg-white/95 ${lbPlatform.text}`}>
                                        <LbIcon className="w-3.5 h-3.5" />
                                        {lbPlatform.name}
                                    </span>
                                </div>

                                {/* Headline + Property Info (bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                                    <h3 className="text-white text-[24px] font-bold leading-tight mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
                                        {lbHeadline}
                                    </h3>
                                    <p className="text-white/90 text-[14px] leading-relaxed line-clamp-3 mb-3" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                                        {lbDesc}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/30">
                                            {lbCampaign.goal || lbCampaign.platform || 'Ad Campaign'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
            <div className="animate-fade-in-up w-full max-w-[1100px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                ✓ Generated
                            </span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                {adCampaigns.length} Campaigns
                            </span>
                        </div>
                        <h2 className="text-[22px] font-semibold text-gray-900 leading-[1.3]">
                            Choose Your Campaign
                        </h2>
                        <p className="text-[14px] text-gray-500 font-normal mt-0.5">
                            Select the campaign that best fits your goals. Click a card to choose it.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRegenerate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shrink-0"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                    </button>
                </div>

                {/* Selectable Campaign Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adCampaigns.map((campaign, index) => {
                        const isSelected = selectedCampaign === index;
                        const platform = getPlatformMeta(campaign.platform);
                        const isGoogle = campaign.platform === 'google';
                        const campaignName = campaign.campaignName || campaign.campaignTitle || 'Campaign';
                        const goal = campaign.goal || '';
                        const allImages =
                            (campaign.carouselImages?.length && campaign.carouselImages) ||
                            campaign.images ||
                            [campaign.imageUrl || campaign.image].filter(Boolean);
                        const activeIdx = campaign.activeImageIndex || 0;
                        const imageUrl = allImages[activeIdx] || null;
                        const description = campaign.primaryText || campaign.descriptions?.[0] || campaign.description || '';

                        const cycleImage = (e, direction) => {
                            e.stopPropagation();
                            const nextIdx = (activeIdx + direction + allImages.length) % allImages.length;
                            setGeneratedAds(prev => {
                                if (!prev?.campaigns) return prev;
                                const updated = [...prev.campaigns];
                                updated[index] = { ...updated[index], activeImageIndex: nextIdx };
                                return { ...prev, campaigns: updated };
                            });
                        };

                        return (
                            <div
                                key={index}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedCampaign(isSelected ? null : index)}
                                className={`
                                    relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col bg-white
                                    ${isSelected
                                        ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15),0_8px_32px_rgba(59,130,246,0.15)] scale-[1.01]'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {/* Selection indicator */}
                                <div className={`
                                    absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                    ${isSelected
                                        ? 'bg-blue-600 border-blue-600 shadow-md'
                                        : 'border-gray-300 bg-white/90 backdrop-blur-sm group-hover:border-blue-400'
                                    }
                                `}>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>

                                {/* ── Composited Ad Creative (Image + CSS Text Overlay) ── */}
                                <div
                                    className="relative w-full aspect-square overflow-hidden flex-shrink-0 cursor-zoom-in"
                                    onClick={(e) => { e.stopPropagation(); setPreviewImage(index); }}
                                >
                                    {/* Background image from Imagen */}
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Ad creative"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-slate-100 to-gray-300 flex flex-col items-center justify-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-pulse">
                                                <Sparkles className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="text-[12px] text-gray-400 font-medium">Generating AI creative...</p>
                                        </div>
                                    )}

                                    {/* Gradient overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                                    {/* Logo + Brand (top-left) */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                        {data?.analysisData?.logo ? (
                                            <img
                                                src={data.analysisData.logo}
                                                alt="Logo"
                                                className="w-8 h-8 rounded-md object-contain bg-white/90 p-0.5 shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-white/90 flex items-center justify-center shadow-sm">
                                                <span className="text-[11px] font-black text-gray-800">
                                                    {(data?.analysisData?.businessName || 'B').charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-white text-[12px] font-semibold drop-shadow-md tracking-wide">
                                            {data?.analysisData?.businessName || 'Brand'}
                                        </span>
                                    </div>

                                    {/* Platform badge (top-right) */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm backdrop-blur-sm bg-white/90 ${platform.text}`}>
                                            <platform.Icon className="w-3 h-3" />
                                            {platform.name}
                                        </span>
                                    </div>

                                    {/* Image navigation arrows + dots (when multiple images) */}
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => cycleImage(e, -1)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                onClick={(e) => cycleImage(e, 1)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                ›
                                            </button>
                                            <div className="absolute top-[calc(100%-60px)] left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                                {allImages.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={(e) => { e.stopPropagation(); cycleImage(e, i - activeIdx); }}
                                                        className={`w-2 h-2 rounded-full transition-all ${i === activeIdx ? 'bg-white scale-125 shadow-md' : 'bg-white/50 hover:bg-white/80'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Headline + Description (bottom) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                        <h4 className="text-white text-[18px] font-bold leading-snug drop-shadow-lg mb-1.5" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                            {campaign.headlines?.[0] || campaignName}
                                        </h4>
                                        <p className="text-white/85 text-[12px] leading-relaxed line-clamp-2 drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                                            {description}
                                        </p>
                                        {goal && (
                                            <span className="inline-block mt-2 text-[9px] font-bold text-white bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                                                {goal}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Card Body ── */}
                                <div className={`p-4 flex flex-col gap-3 flex-grow transition-colors duration-200 ${isSelected ? 'bg-blue-50/30' : 'bg-white'}`}>
                                    <h3 className={`text-[16px] font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {campaignName}
                                    </h3>
                                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3">
                                        {description}
                                    </p>

                                    {/* Targeting tags */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {(isGoogle ? campaign.targeting?.keywords : campaign.targeting?.interests)?.slice(0, 3).map((tag, i) => (
                                            <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${isGoogle ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                            <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Headline</label>
                                            <input
                                                type="text"
                                                value={campaign.headlines?.[0] || ''}
                                                onChange={(e) => updateCampaignField(index, 'headlines', e.target.value)}
                                                className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 text-gray-800 font-medium transition-all"
                                            />
                                        </div>
                                        {!isGoogle && (
                                            <div>
                                                <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Primary Text</label>
                                                <textarea
                                                    rows="2"
                                                    value={campaign.primaryText || ''}
                                                    onChange={(e) => updateCampaignField(index, 'primaryText', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 text-gray-800 resize-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedCampaign(isSelected ? null : index); }}
                                        className={`
                                            mt-auto w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200
                                            ${isSelected
                                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
                                            }
                                        `}
                                    >
                                        {isSelected ? '✓ Selected' : 'Select Campaign'}
                                    </button>
                                </div>

                                {/* Selected state overlay text */}
                                {isSelected && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-blue-600/5 to-transparent h-8 pointer-events-none" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectedCampaign !== null && adCampaigns[selectedCampaign] && (
                    <div className="mt-10 max-w-3xl mx-auto w-full">
                        <h3 className="text-[16px] font-semibold text-gray-900 mb-2 text-center">
                            Carousel &amp; video for your selection
                        </h3>
                        <p className="text-[13px] text-gray-500 text-center mb-4">
                            Scroll the carousel slides and play the auto-built video before continuing.
                        </p>
                        <GeneratedCreativesPanel
                            chosenCampaign={adCampaigns[selectedCampaign]}
                            selectedAdFormat={selectedAdFormat}
                            videoDurationSec={videoDurationSec}
                        />
                    </div>
                )}

                {/* Continue with Selected Campaign button */}
                <div className="mt-8 flex flex-col items-center gap-3">
                    {selectedCampaign === null && (
                        <p className="text-[13px] text-gray-400 flex items-center gap-1.5">
                            <MousePointerClick className="w-4 h-4" />
                            Click a campaign card above to select it
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={selectedCampaign === null}
                        className={`
                            flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-300 cursor-pointer
                            ${selectedCampaign !== null
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-[0.98] hover:gap-3.5'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            }
                        `}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Continue with Selected Campaign
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Footer Nav */}
                <div className="pt-8 mt-4 border-t border-gray-100">
                    <StepNavigation
                        onNext={handleNext}
                        onBack={handleRegenerate}
                        backLabel="Regenerate"
                        nextLabel="Continue with Selected Campaign"
                        nextDisabled={selectedCampaign === null}
                    />
                </div>
            </div>
            </>
        );
    }


    // ═════════════════════════════════════════════════════════════════════════
    //  SELECTION MODE — choose campaigns and platforms
    // ═════════════════════════════════════════════════════════════════════════

    return (
        <div className="animate-fade-in-up w-full max-w-[1100px] mx-auto">
            <div className="space-y-8">

                {/* ─── SECTION 1: RECOMMENDED CAMPAIGNS ─────────────────────── */}
                <div>
                    <div className="mb-5">
                        <h2 className="text-[22px] font-semibold text-gray-900 leading-[1.3]">
                            Recommended Campaigns
                        </h2>
                        <p className="text-[14px] text-gray-500 font-normal mt-1">
                            AI-generated campaigns based on your business analysis. Select the ones you want to run.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {campaigns.map((campaign, index) => {
                            const isSelected = selectedCampaigns.includes(index);
                            const TypeIcon = typeIcons[campaign.type] || Sparkles;

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => toggleCampaign(index)}
                                    className={`
                                        relative text-left p-4 rounded-xl border-2 transition-all duration-200 group cursor-pointer
                                        ${isSelected
                                            ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className={`
                                        absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}
                                    `}>
                                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>

                                    <div className="flex items-start gap-3 pr-8">
                                        <div className={`
                                            w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
                                        `}>
                                            <TypeIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-[14px] font-medium leading-tight mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {campaign.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${priorityStyles[campaign.priority] || priorityStyles.medium}`}>
                                                    {campaign.priority}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-medium">{campaign.type}</span>
                                            </div>
                                            <p className="text-[12px] text-gray-500 font-normal leading-relaxed line-clamp-2">
                                                {campaign.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedCampaigns.length === 0 && (
                        <p className="mt-2 text-[12px] text-red-500 font-medium">
                            Please select at least one campaign to continue.
                        </p>
                    )}
                </div>

                {/* ─── SECTION 2: PLATFORM SELECTION ─────────────────────────── */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-[16px] font-medium text-gray-900 leading-[1.3]">Platforms</h2>
                        <p className="text-[13px] text-gray-500 font-normal mt-0.5">
                            Where do you want your ads to run? Select one or more.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {PLATFORMS.map(platform => {
                            const { id, name, subtext, Icon, bg, text, ring } = platform;
                            const isSelected = selectedPlatforms.includes(id);

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => togglePlatform(id)}
                                    className={`
                                        flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 group cursor-pointer
                                        ${isSelected
                                            ? `${bg} border-current ${text} shadow-sm ring-1 ${ring}`
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-white/70' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-[13px] font-medium leading-tight ${isSelected ? text : 'text-gray-900'}`}>{name}</p>
                                        <p className="text-[10px] text-gray-400 leading-tight">{subtext}</p>
                                    </div>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-1 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {selectedPlatforms.length === 0 && (
                        <p className="mt-2 text-[12px] text-red-500 font-medium">Please select at least one platform.</p>
                    )}
                </div>

                {/* ─── SECTION 3: AI RECOMMENDED AD FORMAT ─────────────────────────── */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
                            AI Recommended Ad Format
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center bg-gray-50/80 p-1.5 rounded-xl mb-5 max-w-fit border border-gray-100">
                        {Object.values(AD_FORMATS).map(format => {
                            const isSelected = selectedAdFormat === format.id;
                            const Icon = format.icon;
                            return (
                                <button
                                    key={format.id}
                                    type="button"
                                    onClick={() => setSelectedAdFormat(format.id)}
                                    className={`
                                        flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                                        ${isSelected 
                                            ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100' 
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 border border-transparent'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-gray-700' : 'text-gray-400'}`} />
                                    <span className="whitespace-pre-line text-center">
                                        {format.label === 'Single Image Ads' ? 'Single Image\nAds' : format.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-violet-50/30 rounded-xl p-5 border border-violet-100/50">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white border border-violet-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <TrendingUp className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="text-[12px] font-bold text-violet-900 mb-1.5">
                                        Why this format?
                                    </h3>
                                    <div className="text-[22px] font-bold text-violet-700 mb-2">
                                        {AD_FORMATS[selectedAdFormat].highlight}
                                    </div>
                                    <p className="text-[13px] text-violet-900/70 leading-relaxed">
                                        {AD_FORMATS[selectedAdFormat].description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#fffdf5] rounded-xl p-5 border border-amber-100/50">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white border border-amber-100 flex items-center justify-center shadow-sm">
                                        <CreditCard className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-amber-900">
                                        Ad Credits
                                    </h3>
                                </div>
                                <div className="text-[14px] font-bold text-amber-700">
                                    316 Left
                                </div>
                            </div>
                            
                            <div className="w-full bg-amber-100/60 rounded-full h-2 mb-3 overflow-hidden">
                                <div className="bg-amber-300 h-full rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            
                            <p className="text-[12px] text-amber-800/80 leading-relaxed">
                                Previewing costs <span className="font-bold text-amber-900">{AD_FORMATS[selectedAdFormat].cost} credits</span>. 
                                Uploading your own media is free.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── PROMOTE EXISTING POST SECTION ──────────────────────────── */}
                {!showPromotePosts ? (
                    <div className="mt-8 bg-[#faf5ff] rounded-2xl p-5 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-purple-50">
                                <Instagram className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900 mb-0.5">Promote Your Existing Post</h3>
                                <p className="text-[13px] text-gray-500">Turn your social post into an ad instantly and save creative credits.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPromotePosts(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm shrink-0"
                        >
                            Promote Now
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[16px] font-bold text-gray-900">Select a Post to Promote</h2>
                            <button
                                onClick={() => setShowPromotePosts(false)}
                                className="text-[13px] text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {EXISTING_POSTS.map(post => {
                                const PlatformIcon = post.platform === 'instagram' ? Instagram : Facebook;
                                const iconColor = post.platform === 'instagram' ? 'text-pink-600' : 'text-blue-600';
                                
                                return (
                                    <div key={post.id} className="bg-white rounded-[20px] border border-gray-200 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all cursor-pointer group">
                                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                            <img src={post.image} alt="post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md border border-white/50">
                                                <PlatformIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 mb-2.5">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[11px] font-medium">{post.date}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-800 leading-[1.6] mb-5 line-clamp-2 min-h-[40px]">
                                                {post.text}
                                            </p>
                                            <div className="flex items-center justify-between text-gray-400 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Heart className="w-3.5 h-3.5" />
                                                        <span className="text-[11px] font-medium">{post.likes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        <span className="text-[11px] font-medium">{post.comments}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">{post.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── AD COPY & DETAILS SECTION ─────────────────────────────── */}
                <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h2 className="text-[18px] font-bold text-gray-900 mb-6">Ad Copy & Details</h2>

                    <div className="space-y-6">
                        {/* Primary Text */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[13px] font-medium text-gray-600">Primary Text</label>
                                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                    AI Generated
                                </span>
                            </div>
                            <textarea
                                rows="3"
                                value={adCopy.primaryText}
                                onChange={(e) => setAdCopy({ ...adCopy, primaryText: e.target.value })}
                                className="w-full px-3.5 py-3 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
                            />
                        </div>

                        {/* Headline & CTA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Headline */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[13px] font-medium text-gray-600">Headline</label>
                                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                        AI Generated
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={adCopy.headline}
                                    onChange={(e) => setAdCopy({ ...adCopy, headline: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                />
                            </div>

                            {/* Call to Action */}
                            <div>
                                <label className="text-[13px] font-medium text-gray-600 block mb-2">Call to Action</label>
                                <select
                                    value={adCopy.cta}
                                    onChange={(e) => setAdCopy({ ...adCopy, cta: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none transition-all"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundPosition: `right 0.75rem center`,
                                        backgroundRepeat: `no-repeat`,
                                        backgroundSize: `1em 1em`
                                    }}
                                >
                                    {CTA_OPTIONS.map(opt => {
                                        const isMetaSelected = selectedPlatforms.includes('meta') || selectedPlatforms.includes('instagram');
                                        const isGoogleSelected = selectedPlatforms.includes('google');
                                        
                                        let disabledText = '';
                                        let isDisabled = false;
                                        
                                        if (opt.unsupported.includes('meta') && isMetaSelected) {
                                            disabledText = ' (Not supported on Meta Ads)';
                                            isDisabled = true;
                                        }
                                        if (opt.unsupported.includes('google') && isGoogleSelected) {
                                            disabledText = disabledText ? ' (Not supported)' : ' (Not supported on Google Ads)';
                                            isDisabled = true;
                                        }
                                        
                                        return (
                                            <option key={opt.value} value={opt.value} disabled={isDisabled}>
                                                {opt.label}{isDisabled ? disabledText : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── SECTION 4: GENERATE ───────────────────────────────────── */}
                <div className="bg-linear-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200 p-5 md:p-6 mt-8">
                    {/* Image count selector + video duration */}
                    <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="text-[13px] font-medium text-gray-800 mb-2.5 block">Number of ad creatives to generate</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[1, 2, 3, 4].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setNumberOfImages(num)}
                                    className={`
                                        relative px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 cursor-pointer border-2
                                        ${numberOfImages === num
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }
                                    `}
                                >
                                    {num}
                                    {num === 2 && (
                                        <span className={`absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full ${numberOfImages === 2 ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                                            REC
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        </div>
                        <div>
                            <label className="text-[13px] font-medium text-gray-800 mb-2.5 block">Video duration</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {[8, 12, 15, 20, 30, 45, 60, 90, 120].map((sec) => (
                                    <button
                                        key={sec}
                                        type="button"
                                        onClick={() => setVideoDurationSec(sec)}
                                        className={`
                                            px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer border-2
                                            ${videoDurationSec === sec
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                            }
                                        `}
                                    >
                                        {sec}s
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                Generated preview video will play for about {videoDurationSec} seconds.
                            </p>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5">
                            {selectedAdFormat === 'carousel' || selectedAdFormat === 'video' ? (
                                <>
                                    Carousel &amp; video modes generate several slides per social campaign (Google capped at 2).
                                    Generation can take a few minutes.
                                </>
                            ) : (
                                <>
                                    {numberOfImages === 1 ? '1 image per campaign' : `${numberOfImages} images per campaign`}
                                    {numberOfImages >= 3 && ' — may take longer to generate'}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1.5">
                            <h3 className="text-[14px] font-medium text-gray-900">Ready to generate your ads</h3>
                            <div className="flex items-center gap-3 text-[12px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                    {selectedCampaigns.length} campaign{selectedCampaigns.length !== 1 ? 's' : ''}
                                </span>
                                <span className="w-px h-3 bg-gray-300" />
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                                </span>
                                <span className="w-px h-3 bg-gray-300" />
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                    {numberOfImages} image{numberOfImages !== 1 ? 's' : ''} each
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={!canProceed || isGenerating}
                            className={`
                                flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl text-[15px] font-semibold transition-all duration-200 cursor-pointer shrink-0
                                ${canProceed && !isGenerating
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate {numberOfImages * selectedPlatforms.length} Ad{numberOfImages * selectedPlatforms.length !== 1 ? 's' : ''}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer Nav */}
            <div className="pt-8 mt-8 border-t border-gray-100">
                <StepNavigation
                    onNext={handleGenerate}
                    onBack={onBack}
                    nextLabel={isGenerating ? 'Generating...' : 'Generate Ads'}
                    nextDisabled={!canProceed || isGenerating}
                />
            </div>
        </div>
    );
};

export default StepAdCreation;

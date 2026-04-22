import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, FlaskConical, ChevronDown, Shield, MapPin, DollarSign, Tag, Briefcase, Globe, Target,
  Sparkles, Layers, Award, ArrowRight, Zap, Users, Star, BrainCircuit, Activity, AlertTriangle
} from 'lucide-react';
import StepNavigation from '../components/StepNavigation';
import Button from '../../../../components/ui/Button';

const AIBadge = ({ label, type = 'ai' }) => {
    const styles = {
        ai: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest border shadow-sm ${styles[type]}`}>
            {type === 'ai' && <Sparkles className="w-3 h-3" />}
            {type === 'success' && <Activity className="w-3 h-3" />}
            {type === 'warning' && <Activity className="w-3 h-3" />}
            {label}
        </span>
    );
};

const SkeletonCard = ({ className = '' }) => (
    <div className={`bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 animate-pulse ${className}`}>
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2 mt-auto">
            <div className="h-3 w-full bg-slate-100 rounded"></div>
            <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
            <div className="h-3 w-4/6 bg-slate-100 rounded"></div>
        </div>
    </div>
);

const platformColors = {
    'Reddit': 'bg-orange-50 text-orange-600 border-orange-100',
    'Instagram': 'bg-pink-50 text-pink-600 border-pink-100',
    'TikTok': 'bg-slate-800 text-white border-slate-700',
    'YouTube': 'bg-red-50 text-red-600 border-red-100',
    'Twitter': 'bg-sky-50 text-sky-600 border-sky-100',
    'X': 'bg-slate-100 text-slate-800 border-slate-200',
    'LinkedIn': 'bg-blue-50 text-blue-700 border-blue-100',
    'Google Trends': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Facebook': 'bg-blue-50 text-blue-600 border-blue-100',
    'Pinterest': 'bg-rose-50 text-rose-600 border-rose-100',
};

const ResearchDirectionCard = ({ research }) => {
    const [questionsOpen, setQuestionsOpen] = useState(false);
    const { goals = [], platforms = [], questions = [] } = research;

    return (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-violet-500" />
                    Research Direction
                </h3>
                <AIBadge label="Auto-detected insights" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Goals */}
                <div>
                    <h4 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Primary Goals</h4>
                    <ol className="space-y-2">
                        {goals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 font-normal leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <span>{goal}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Platforms */}
                <div>
                    <h4 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Recommended Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                        {platforms.map((platform, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border shadow-sm ${platformColors[platform] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                {platform}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Questions — Collapsible */}
            {questions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => setQuestionsOpen(!questionsOpen)}
                        className="flex items-center gap-2 text-[12px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors cursor-pointer w-full"
                    >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${questionsOpen ? 'rotate-180' : ''}`} />
                        Key Research Questions ({questions.length})
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${questionsOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                        <ul className="space-y-2">
                            {questions.map((q, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 font-normal leading-relaxed bg-slate-50/60 rounded-lg px-3 py-2 border border-slate-100/80">
                                    <span className="text-violet-400 shrink-0 mt-0.5">?</span>
                                    <span>{q}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const urgencyConfig = {
    low: { label: 'Low Urgency', style: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    medium: { label: 'Medium Urgency', style: 'bg-amber-50 text-amber-600 border-amber-100' },
    high: { label: 'High Urgency', style: 'bg-red-50 text-red-600 border-red-100' },
};

const ReputationManagementCard = ({ reputation }) => {
    const { urgency = 'medium', focusAreas = [], insight = '' } = reputation;
    const config = urgencyConfig[urgency] || urgencyConfig.medium;

    return (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Reputation Management
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest border shadow-sm ${config.style}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {config.label}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Focus Areas */}
                <div className="md:col-span-2">
                    <h4 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Focus Areas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {focusAreas.map((area, i) => (
                            <div key={i} className="flex items-center gap-2 text-[13px] text-slate-600 font-normal leading-relaxed bg-slate-50/60 rounded-lg px-3 py-2 border border-slate-100/80 hover:bg-amber-50/30 hover:border-amber-100 transition-colors duration-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{area}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight */}
                <div className="bg-amber-50/40 rounded-lg border border-amber-100/60 p-3.5">
                    <h4 className="text-[12px] font-semibold text-amber-700 uppercase tracking-wider mb-2">Why It Matters</h4>
                    <p className="text-[13px] text-amber-900/70 font-normal leading-relaxed">
                        {insight}
                    </p>
                </div>
            </div>
        </div>
    );
};

const StepAIAnalysis = ({ onComplete, onBack, data, isAnalyzing }) => {
    const analysis = data?.analysisData;
    
    // Resolve logo with smart fallback chain
    const websiteUrl = data?.websiteUrl;
    const getGoogleFavicon = (url) => {
        if (!url) return null;
        try {
            const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch { return null; }
    };
    const logoUrl = analysis?.logo || getGoogleFavicon(websiteUrl) || analysis?.products?.[0]?.image || null;

    console.log('[StepAIAnalysis] logoUrl:', logoUrl, '| analysis.logo:', analysis?.logo, '| websiteUrl:', websiteUrl);

    const handleNext = () => {
        if (onComplete) {
            onComplete({});
        }
    };

    if (!analysis || isAnalyzing) {
        return (
            <div className="max-w-[1150px] mx-auto py-6 animate-fade-in-up">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <BrainCircuit className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-600 uppercase tracking-widest animate-pulse">
                        Analyzing Website & Building Strategy...
                    </span>
                </div>
                
                <div className="flex flex-col gap-4">
                    {/* Hero Skeleton (Top Summary) */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-md p-5 flex flex-col md:flex-row gap-6 animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0"></div>
                        <div className="pt-0.5 z-10 w-full space-y-3">
                            <div className="h-5 w-1/4 bg-slate-200 rounded"></div>
                            <div className="flex gap-2">
                                <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                                <div className="h-4 w-20 bg-slate-100 rounded-full"></div>
                                <div className="h-4 w-14 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                            <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 w-full md:w-80 shrink-0 h-24"></div>
                    </div>

                    {/* Split 2 Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SkeletonCard className="h-48" />
                        <SkeletonCard className="h-48" />
                    </div>

                    {/* Full width List Skeleton */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-md p-5 h-64 animate-pulse pt-6">
                         <div className="h-4 w-1/4 bg-slate-200 rounded mb-6"></div>
                         <div className="grid grid-cols-5 gap-4">
                             {[1,2,3,4,5].map(i => (
                                 <div key={i} className="h-32 bg-slate-100 rounded-lg"></div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    const businessName = data?.description?.split(' ')[0] || data?.name || 'Your Business';

    return (
        <div className="max-w-[1150px] mx-auto py-6 animate-fade-in-up">
            
            {analysis.error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 shadow-sm animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[15px] font-medium text-amber-900 leading-[1.3]">Partial Analysis Recovered</h4>
                        <p className="text-[13px] font-normal text-amber-800/80 mt-1 leading-relaxed">
                            We couldn't fully analyze the provided website due to connection blocks, but we've synthesized an inferred AI marketing strategy to keep you moving forward.
                        </p>
                    </div>
                </div>
            )}
            
            {/* Progression Hint */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <BrainCircuit className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-600 uppercase tracking-widest">
                    Analysis complete — ready to generate campaigns
                </span>
            </div>

            <div className="flex flex-col gap-4">
                
                {/* SECTION 1 - TOP SUMMARY CARD (HERO) */}
                <div className="bg-linear-to-br from-white to-slate-50/50 rounded-xl border border-slate-200/80 shadow-md p-5 flex flex-col md:flex-row gap-6 items-start justify-between relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                    {/* Subtle decorative background glow */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-50/60 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-200/60 shadow-sm relative z-10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                            {logoUrl ? (
                                <img 
                                    src={logoUrl} 
                                    alt={businessName} 
                                    className="w-full h-full object-contain p-1.5"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center text-indigo-600 bg-indigo-50/80 ${logoUrl ? 'hidden' : 'flex'}`}>
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="pt-0.5 z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-[22px] font-semibold text-slate-900 leading-[1.3]">{businessName}</h2>
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                    {(analysis.tags || []).map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-default rounded text-[10px] font-medium border border-slate-200/60 uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-500 text-[14px] font-normal leading-relaxed max-w-3xl mt-1.5">
                                {analysis.businessSummary || "No summary available."}
                            </p>
                        </div>
                    </div>

                    {/* Right insight box */}
                    <div className={`rounded-xl p-3.5 w-full md:w-80 shrink-0 flex items-start gap-3 z-10 ring-1 ring-white/60 border shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] ${
                        analysis.error
                            ? 'bg-linear-to-br from-amber-50/90 to-orange-50/50 border-amber-200/70'
                            : 'bg-linear-to-br from-indigo-50/80 to-purple-50/50 border-indigo-100/60'
                    }`}>
                         <div className={`w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                             analysis.error ? 'border-amber-100' : 'border-indigo-50'
                         }`}>
                             <Sparkles className={`w-3.5 h-3.5 ${analysis.error ? 'text-amber-600' : 'text-indigo-500'}`} />
                         </div>
                         <div>
                             <h4 className={`text-[12px] font-semibold mb-1 uppercase tracking-wider flex items-center gap-2 leading-[1.3] ${
                                 analysis.error ? 'text-amber-950' : 'text-indigo-900'
                             }`}>
                                 {analysis.error ? 'Limited AI output' : 'AI analysis ready'}
                             </h4>
                             <p className={`text-[13px] font-normal leading-relaxed ${
                                 analysis.error ? 'text-amber-900/85' : 'text-indigo-800/80'
                             }`}>
                                 {analysis.error
                                     ? 'Full AI output was not available. The brief below blends safe placeholders with anything we could pull from your site or uploaded files. Your admin can enable the backend AI key (OpenAI or Gemini) for richer analysis.'
                                     : 'Your business profile has been analyzed. High-impact marketing opportunities identified.'}
                             </p>
                         </div>
                    </div>
                </div>

                {/* SECTION 1.5 - BUSINESS SIGNALS */}
                {analysis.businessSignals && (() => {
                    const signals = [
                        { key: 'location', label: 'Location', icon: MapPin, color: 'text-rose-500 bg-rose-50 border-rose-100' },
                        { key: 'currency', label: 'Currency', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                        { key: 'pricingLevel', label: 'Pricing', icon: Tag, color: 'text-violet-500 bg-violet-50 border-violet-100' },
                        { key: 'businessModel', label: 'Model', icon: Briefcase, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                        { key: 'industry', label: 'Industry', icon: Layers, color: 'text-amber-500 bg-amber-50 border-amber-100' },
                        { key: 'targetMarket', label: 'Market', icon: Globe, color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
                    ].filter(s => analysis.businessSignals[s.key]);

                    return signals.length > 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" />
                                    Business Signals
                                </h3>
                                <AIBadge label="AI detected" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                {signals.map(({ key, label, icon: Icon, color }) => (
                                    <div key={key} className="flex items-center gap-2.5 rounded-[10px] bg-slate-50/60 border border-slate-100/80 px-3 py-2.5 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-200">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
                                            <p className="text-[13px] font-medium text-slate-700 truncate leading-tight">{analysis.businessSignals[key]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* SECTION 2 - BRAND IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Brand Personality Insights */}
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 flex flex-col h-full group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                                <Star className="w-4 h-4 text-slate-400" />
                                Brand Personality Insights
                            </h3>
                            <AIBadge label="Auto-detected" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-[22px] font-semibold text-slate-900 leading-[1.3]">
                                {analysis.brandPersonality?.archetype || 'Professional'}
                            </div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium uppercase tracking-wider">
                                Archetype
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                            {(analysis.brandPersonality?.traits || []).map((trait, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white hover:bg-slate-50 transition-colors text-slate-500 rounded shadow-sm text-[12px] font-medium border border-slate-200/80">
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Key Differentiators */}
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 flex flex-col h-full group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                                <Award className="w-4 h-4 text-slate-400" />
                                Key Differentiators
                            </h3>
                            <AIBadge label="Based on your website" />
                        </div>
                        <ul className="space-y-2 mt-auto">
                            {(analysis.keyDifferentiators || []).map((trait, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] font-normal text-slate-500 leading-relaxed">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition-transform mt-0.5" />
                                    <span>{trait}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* SECTION 3 - PRODUCTS */}
                {analysis.products && analysis.products.length > 0 && (
                    <div className="bg-linear-to-b from-white to-slate-50/50 rounded-xl border border-slate-200/80 shadow-md p-5 md:p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" />
                                Extracted Products & Assets
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                            {analysis.products.map((prod, num) => {
                                // Smart image fallback: product image → scraped images by index → null
                                const scrapedImages = analysis.images || [];
                                const productImage = (prod.image && prod.image !== 'null' && prod.image !== 'undefined') 
                                    ? prod.image 
                                    : scrapedImages[num] || null;
                                
                                const gradients = [
                                    'from-blue-50 to-indigo-100',
                                    'from-purple-50 to-pink-100', 
                                    'from-emerald-50 to-teal-100',
                                    'from-amber-50 to-orange-100',
                                    'from-cyan-50 to-sky-100',
                                    'from-rose-50 to-red-100',
                                ];
                                
                                return (
                                <div key={num} className="bg-white rounded-[14px] border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-lg hover:border-blue-200 hover:-translate-y-[3px] transition-all duration-300 cursor-pointer flex flex-col h-64">
                                    <div className="h-[70%] w-full bg-slate-100 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                                        {productImage ? (
                                            <img 
                                                src={productImage} 
                                                alt={prod.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full items-center justify-center bg-linear-to-br ${gradients[num % gradients.length]} ${productImage ? 'hidden' : 'flex'} flex-col gap-2`}>
                                            <span className="text-3xl font-semibold text-slate-400/60">{prod.name?.[0] || '?'}</span>
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{prod.category || 'Product'}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-3.5 flex flex-col justify-center flex-1 bg-white">
                                        <h4 className="text-[14px] font-medium text-slate-900 mb-1 leading-[1.3] line-clamp-1">{prod.name}</h4>
                                        <p className="text-[12px] text-slate-500 font-normal truncate">{prod.category || 'Product'}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}

                {/* SECTION 4 - COMPETITORS */}
                {analysis.competitors && analysis.competitors.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 md:p-5 flex flex-col hover:shadow-md transition-shadow">
                        <h3 className="text-base font-medium text-slate-900 leading-[1.3] mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Competitors Landscape
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {analysis.competitors.map((comp, idx) => (
                                <div key={idx} className="bg-slate-50/60 rounded-lg border border-slate-100/80 p-3 flex items-center gap-3 justify-between group hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-md shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-blue-200 transition-colors">
                                            <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">{comp.name[0]}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[14px] font-medium text-slate-900 leading-[1.3] mb-0.5">{comp.name}</h4>
                                            <p className="text-[12px] text-slate-500 font-normal truncate max-w-[150px]">{comp.description || comp.type}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white text-slate-500 rounded text-[10px] font-medium border border-slate-200 uppercase tracking-widest shadow-sm shrink-0">
                                        {comp.type || 'Direct'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SECTION 5 - RESEARCH DIRECTION */}
                {analysis.researchDirection && (
                    <ResearchDirectionCard research={analysis.researchDirection} />
                )}

                {/* SECTION 6 - REPUTATION MANAGEMENT */}
                {analysis.reputationManagement && (
                    <ReputationManagementCard reputation={analysis.reputationManagement} />
                )}

                {/* SECTION 7 - MARKETING STRATEGY */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-md p-5 md:p-6 group hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium uppercase tracking-widest border border-blue-100">
                                Phase
                            </span>
                            <h3 className="text-[15px] font-semibold text-slate-900 capitalize leading-[1.3]">
                                {analysis.brandMaturity?.stage?.replace('_', ' ') || 'Growth'}
                            </h3>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <AIBadge label="AI Generated" />
                            <AIBadge label="High Confidence" type="success" />
                        </div>
                    </div>
                    <p className="text-slate-500 text-[13px] font-normal leading-relaxed mb-4 max-w-4xl">
                        {analysis.brandMaturity?.explanation || 'A tailored marketing progression plan focusing on establishing presence while optimizing pathways to scale acquisition.'}
                    </p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {(analysis.growthPriorities || []).map((item, i) => (
                            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-start hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm shrink-0">
                                        {i+1}
                                    </div>
                                    <h5 className="font-medium text-slate-900 text-[14px] leading-[1.3] line-clamp-1">{item.title}</h5>
                                </div>
                                <p className="text-[12px] text-slate-500 font-normal pl-6 leading-relaxed line-clamp-2">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 6 - STRATEGY SPLIT (2 COLUMN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: Paid Strategy */}
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 relative overflow-hidden flex flex-col h-full group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <h3 className="text-[15px] font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                Paid Strategy
                            </h3>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-medium border border-slate-100 uppercase tracking-widest hidden sm:block">
                                {analysis.paidStrategy?.budget || 'Budget'}
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-normal leading-relaxed pl-2 mb-4">
                            {analysis.paidStrategy?.description}
                        </p>
                        <div className="mt-auto flex gap-1.5 flex-wrap pl-2">
                            {(analysis.paidStrategy?.channels || []).map((ch, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white hover:bg-slate-50 transition-colors cursor-default text-slate-500 border border-slate-200 shadow-sm rounded text-[12px] font-medium">
                                    {ch}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Organic Strategy */}
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 relative overflow-hidden flex flex-col h-full group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <h3 className="text-[15px] font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" />
                                Organic Strategy
                            </h3>
                        </div>
                        <p className="text-[13px] text-slate-500 font-normal leading-relaxed pl-2 mb-4">
                            {analysis.organicStrategy?.description}
                        </p>
                        <div className="mt-auto flex gap-1.5 flex-wrap pl-2">
                            {(analysis.organicStrategy?.contentPillars || []).concat(analysis.organicStrategy?.platforms || []).map((ch, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white hover:bg-slate-50 transition-colors cursor-default text-slate-500 border border-slate-200 shadow-sm rounded text-[12px] font-medium">
                                    {ch}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 7 - CAMPAIGN RECOMMENDATIONS */}
                <div className="bg-linear-to-b from-white to-slate-50/50 rounded-xl border border-blue-200/70 shadow-md flex flex-col overflow-hidden ring-1 ring-blue-50 group/section hover:shadow-lg transition-all duration-300">
                    <div className="p-4 border-b border-indigo-100/50 bg-linear-to-r from-slate-50/50 to-indigo-50/30 flex items-center justify-between">
                         <h3 className="text-base font-medium text-slate-900 leading-[1.3] flex items-center gap-2">
                             <Zap className="w-4 h-4 text-blue-500" />
                             Recommended Campaigns for Growth
                         </h3>
                         <span className="text-[11px] text-indigo-500 font-semibold uppercase tracking-widest bg-white px-2.5 py-1 rounded shadow-sm border border-indigo-50">
                             {(analysis.campaignRecommendations || []).length} Actions Ready
                         </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(analysis.campaignRecommendations || []).map((rec, idx) => {
                            const isHigh = String(rec.priority || '').toLowerCase() === 'high';
                            const prioLabel = isHigh ? 'High Confidence' : 'Medium Confidence';
                            const color = isHigh ? 'success' : 'warning';
                            const dot = isHigh ? 'bg-emerald-500' : 'bg-amber-400';

                            return (
                                <div key={idx} className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-indigo-50/40 transition-colors duration-200 group cursor-pointer relative">
                                    {/* Hover subtle left highlight */}
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 flex-1 pl-2 md:pl-0">
                                        <div className="flex items-center gap-2.5 w-64 lg:w-80">
                                            <div className={`w-2 h-2 rounded-full ${dot} shadow-[0_0_8px_rgba(0,0,0,0.1)] shrink-0`}></div>
                                            <div className="text-[15px] font-medium text-slate-900 leading-[1.3]">{rec.title || rec.type}</div>
                                        </div>
                                        <div className="shrink-0 w-36">
                                            <AIBadge label={prioLabel} type={color} />
                                        </div>
                                        <p className="text-[13px] text-slate-500 font-normal leading-relaxed flex-1 pt-[2px] line-clamp-1 group-hover:text-slate-700 transition-colors">
                                            {rec.description}
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 shrink-0">
                                        <span className="text-[11px] font-medium uppercase tracking-widest">Use this</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="mt-8">
                <StepNavigation
                    onNext={handleNext}
                    onBack={onBack}
                    nextLabel="Launch Campaigns"
                />
            </div>
        </div>
    );
};

export default StepAIAnalysis;


import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Rocket, ArrowLeft, Building2, Layout, Edit2, CheckSquare, Square,
    AlertCircle, ArrowRight, CheckCircle2, XCircle, Info, Loader2,
} from 'lucide-react';
import { Facebook, Linkedin, Instagram, Twitter } from 'lucide-react';
import { useIntegrations } from '../../../../context/IntegrationContext';
import { useMarketing } from '../../../../context/MarketingContext';
import { canLaunchCampaign, getIntegrationErrors } from '../../../../utils/campaignGuard';
import { usePreferences } from '../../../../context/PreferencesContext';
import api from '../../../../lib/api';

// Mirror platform registry from StepPlatformBudget
const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const REVIEW_PLATFORM_REGISTRY = {
    meta:      { name: 'Meta Ads',     Icon: Facebook,  bg: 'bg-blue-50',   text: 'text-blue-600',   bar: 'bg-blue-500'   },
    google:    { name: 'Google Ads',   Icon: GoogleIcon, bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-500' },
    linkedin:  { name: 'LinkedIn Ads', Icon: Linkedin,  bg: 'bg-sky-50',    text: 'text-sky-700',    bar: 'bg-sky-600'    },
    youtube:   { name: 'YouTube Ads',  Icon: null,      bg: 'bg-red-50',    text: 'text-red-600',    bar: 'bg-red-500'    },
    twitter:   { name: 'X / Twitter',  Icon: Twitter,   bg: 'bg-gray-100',  text: 'text-gray-800',   bar: 'bg-gray-700'   },
    instagram: { name: 'Instagram',    Icon: Instagram, bg: 'bg-pink-50',   text: 'text-pink-600',   bar: 'bg-pink-500'   },
};

// Map integration context keys → platform IDs used by the publish endpoint
const PLATFORM_INTEGRATION_KEY = {
    facebook: 'meta',
    meta:     'meta',
    google:   'google',
};

const WIZARD_STATE_KEY = 'salespal_campaign_wizard_state';

const StepReviewLaunch = ({ onLaunch, onBack, data }) => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [isConfirmed, setIsConfirmed] = useState(true);
    const [isLaunching, setIsLaunching] = useState(false);
    const { integrations, connectIntegration } = useIntegrations();
    const { formatCurrency } = usePreferences();

    // Derive platforms from budget split data
    const derivePlatforms = () => {
        const platforms = [];
        const budgetSplit = data?.budget?.split;
        if (budgetSplit?.meta > 0)   platforms.push('facebook');
        if (budgetSplit?.google > 0) platforms.push('google');
        return platforms.length === 0 ? ['facebook', 'google'] : platforms;
    };

    const detectedPlatforms = (data?.platforms?.length > 0) ? data.platforms : derivePlatforms();
    const campaign = { platforms: detectedPlatforms };

    const launchCheck = canLaunchCampaign(campaign, integrations);
    const integrationErrors = getIntegrationErrors(campaign, integrations);
    const hasIntegrationErrors = integrationErrors.length > 0;
    const canLaunch = isConfirmed && launchCheck.allowed;

    const [launchError, setLaunchError] = useState(null);

    // Publish results: { [platform]: { status: 'success'|'error'|'not_connected', message } }
    const [publishResults, setPublishResults] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const analysis = data?.analysisData || {};
    const chosenCampaign = data?.adSettings?.chosenCampaign || {};
    const businessName = analysis?.businessName || analysis?.tags?.[0] || 'Business';
    const businessIndustry = analysis?.businessSignals?.industry || analysis?.industry || 'General';
    const businessLocation = analysis?.businessSignals?.location || 'Global';
    const website = data?.websiteUrl || analysis?.website || '';
    const adHeadline = chosenCampaign?.headlines?.[0] || chosenCampaign?.campaignName || chosenCampaign?.campaignTitle || 'Untitled ad';
    const adPrimaryText = chosenCampaign?.primaryText || chosenCampaign?.descriptions?.[0] || 'No ad copy provided yet.';
    const adPlatforms = (data?.adSettings?.platforms || detectedPlatforms).map((p) => {
        const key = p === 'facebook' ? 'meta' : p;
        return REVIEW_PLATFORM_REGISTRY[key]?.name || p;
    });
    const adPreviewImage = chosenCampaign?.image || chosenCampaign?.imageUrl || null;

    // DEBUG: Remove after testing
    console.log('[StepReviewLaunch] Guard Debug:', {
        platforms: campaign.platforms,
        integrations: {
            meta: integrations?.meta?.connected,
            google: integrations?.google?.connected,
            linkedin: integrations?.linkedin?.connected,
        },
        launchCheck,
        canLaunch,
    });

    const handleLaunch = () => {
        const check = canLaunchCampaign(campaign, integrations);
        if (!check.allowed) {
            setLaunchError({ message: `Connect ${check.missing.join(', ')} to launch this campaign`, missing: check.missing });
            return;
        }
        if (!isConfirmed) return;

        setLaunchError(null);
        setIsLaunching(true);

        setTimeout(async () => {
            if (onLaunch) {
                const res = await onLaunch();
                if (res && res.error) {
                    setLaunchError({ message: res.error });
                    setIsLaunching(false);
                    return;
                }

                // After DB save succeeds, attempt to publish to each connected platform
                const campaignId = res?.id || res?.campaignId;
                if (campaignId) {
                    await runPlatformPublish(campaignId);
                }
            }
        }, 1500);
    };

    /**
     * For each platform in detectedPlatforms:
     *   - If connected: POST /marketing/campaigns/:id/publish and record result
     *   - If not connected: mark 'not_connected'
     */
    const runPlatformPublish = async (campaignId) => {
        setIsPublishing(true);
        const results = {};

        for (const platform of detectedPlatforms) {
            const integrationKey = PLATFORM_INTEGRATION_KEY[platform] || platform;
            const isConnected = integrations[integrationKey]?.connected;

            if (!isConnected) {
                const meta = REVIEW_PLATFORM_REGISTRY[integrationKey] || REVIEW_PLATFORM_REGISTRY[platform];
                results[platform] = {
                    status: 'not_connected',
                    message: `Connect ${meta?.name || platform} in Settings to publish there`,
                };
                continue;
            }

            try {
                const { data: pubData } = await api.post(
                    `/marketing/campaigns/${campaignId}/publish`,
                    { platforms: [platform] }
                );
                const platformResult = pubData?.results?.[platform] || pubData?.results?.facebook;
                if (platformResult?.success) {
                    results[platform] = { status: 'success', message: `Published (ID: ${platformResult.campaignId})` };
                } else {
                    results[platform] = { status: 'error', message: platformResult?.error || 'Publish failed' };
                }
            } catch (err) {
                results[platform] = {
                    status: 'error',
                    message: err?.response?.data?.error?.message || err?.message || 'Publish failed',
                };
            }
        }

        setPublishResults(results);
        setIsPublishing(false);
        setIsLaunching(false);
    };

    const handleConnectTrigger = async (platformId) => {
        await connectIntegration(platformId);
        setLaunchError(null);
    };

    const SectionHeader = ({ title }) => (
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">{title}</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                <Edit2 className="w-3 h-3" /> Edit
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in-up space-y-8 pb-4">

            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8">

                {/* 1. Business Info */}
                <div>
                    <SectionHeader title="Business Summary" />
                    <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-medium text-gray-900">{businessName}</h4>
                            <p className="text-sm text-gray-600">{businessIndustry}</p>
                            <p className="text-sm text-gray-600">{businessLocation}</p>
                            {website ? (
                                <a href={website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                    {website}
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400">No website provided</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Target Audience */}
                <div>
                    <SectionHeader title="Target Audience" />
                    <div className="flex flex-wrap gap-2">
                        {(analysis?.tags || []).slice(0, 4).map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{tag}</span>
                        ))}
                        {(!analysis?.tags || analysis.tags.length === 0) && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">General Audience</span>
                        )}
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        {analysis?.targetAudience?.description || 'Audience inferred from your business analysis and selected platforms.'}
                    </p>
                </div>

                <div className="lg:col-span-2 h-px bg-gray-100" />

                {/* 3. Ads Summary */}
                <div>
                    <SectionHeader title="Ad Creative" />
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex gap-4">
                        {adPreviewImage ? (
                            <img src={adPreviewImage} alt="Ad creative" className="w-20 h-24 object-cover rounded-lg shrink-0 border border-gray-200" />
                        ) : (
                            <div className="w-20 h-24 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center">
                                <Layout className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                        <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {adPlatforms.join(' + ') || 'No platform selected'}
                                </span>
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm truncate">{adHeadline}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{adPrimaryText}</p>
                            <p className="text-xs font-medium text-gray-700 mt-1">CTA: {chosenCampaign?.cta || 'Learn More'}</p>
                        </div>
                    </div>
                </div>

                {/* 4. Budget Summary */}
                <div>
                    <SectionHeader title="Budget &amp; Spend" />
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Daily Budget</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(data?.budget?.daily || 3500)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Monthly Estimate</span>
                            <span className="font-semibold text-gray-900">{formatCurrency((data?.budget?.daily || 3500) * 30)}</span>
                        </div>

                        {data?.budget?.perPlatform ? (
                            <>
                                <div className="w-full h-2 rounded-full overflow-hidden flex gap-px mt-1">
                                    {Object.entries(data.budget.perPlatform).map(([id, amount]) => {
                                        const meta = REVIEW_PLATFORM_REGISTRY[id];
                                        const pct = data.budget.daily > 0 ? Math.round((amount / data.budget.daily) * 100) : 0;
                                        return meta ? (
                                            <div key={id} className={`h-full ${meta.bar}`} style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }} title={`${meta.name}: ${pct}%`} />
                                        ) : null;
                                    })}
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    {Object.entries(data.budget.perPlatform).map(([id, amount]) => {
                                        const meta = REVIEW_PLATFORM_REGISTRY[id];
                                        if (!meta) return null;
                                        const Icon = meta.Icon;
                                        const pct = data.budget.split?.[id] ?? (data.budget.daily > 0 ? Math.round((amount / data.budget.daily) * 100) : 0);
                                        return (
                                            <div key={id} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5 text-gray-600">
                                                    {Icon && <span className="w-3 h-3 inline-flex items-center justify-center"><Icon className="w-3 h-3" /></span>}
                                                    {meta.name}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${meta.bg} ${meta.text}`}>{pct}%</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-2 flex">
                                    <div className="bg-blue-600 h-full w-[60%]" title="Meta 60%" />
                                    <div className="bg-orange-500 h-full w-[40%]" title="Google 40%" />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /> Meta Ads 60%</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Google 40%</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Integration Warning */}
            {hasIntegrationErrors && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">Missing Required Integrations</h4>
                            <ul className="space-y-2 mb-3">
                                {integrationErrors.map((error) => (
                                    <li key={error.id} className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-red-700">{error.message}</span>
                                        <button
                                            onClick={() => handleConnectTrigger(error.id)}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 whitespace-nowrap"
                                        >
                                            Connect <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-red-600">You must connect these platforms to launch your campaign. You will be redirected back here.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Launch Error */}
            {launchError && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-amber-800 mb-2">Cannot Launch Campaign</h4>
                            <p className="text-sm text-amber-700 mb-4">{launchError.message}</p>
                            <div className="flex gap-2">
                                {launchError.missing && launchError.missing.map(platform => {
                                    const id = platform.toLowerCase().includes('google') ? 'google'
                                        : platform.toLowerCase().includes('linkedin') ? 'linkedin' : 'meta';
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleConnectTrigger(id)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
                                        >
                                            Connect {platform}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Platform Publish Results */}
            {(isPublishing || publishResults) && (
                <div className="border border-gray-200 rounded-xl p-5 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {isPublishing
                            ? <><Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Publishing to platforms…</>
                            : 'Platform Publish Results'
                        }
                    </h4>
                    {publishResults && Object.entries(publishResults).map(([platform, result]) => {
                        const integrationKey = PLATFORM_INTEGRATION_KEY[platform] || platform;
                        const meta = REVIEW_PLATFORM_REGISTRY[integrationKey] || REVIEW_PLATFORM_REGISTRY[platform] || {};
                        const Icon = meta.Icon;
                        return (
                            <div key={platform} className={`flex items-start gap-3 p-3 rounded-lg border ${
                                result.status === 'success'       ? 'bg-green-50 border-green-200'
                                : result.status === 'not_connected' ? 'bg-gray-50 border-gray-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                                {result.status === 'success'
                                    ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    : result.status === 'not_connected'
                                        ? <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                }
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                        {Icon && <Icon className="w-3.5 h-3.5" />}
                                        {meta.name || platform}
                                    </span>
                                    <p className={`text-xs mt-0.5 ${
                                        result.status === 'success'       ? 'text-green-700'
                                        : result.status === 'not_connected' ? 'text-gray-500'
                                        : 'text-red-700'
                                    }`}>
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 5. Final Confirmation & Actions */}
            <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 mb-8 cursor-pointer" onClick={() => setIsConfirmed(!isConfirmed)}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 transition-colors ${isConfirmed ? 'text-green-600' : 'text-gray-300'}`}>
                            {isConfirmed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 select-none">I understand that SalesPal AI will optimize this campaign automatically.</p>
                            <p className="text-xs text-gray-500 mt-1 select-none">You can pause, edit, or cancel this campaign at any time from your dashboard.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={onBack}
                        className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                        onClick={handleLaunch}
                        disabled={!canLaunch || isLaunching || isPublishing}
                        className={`
                            group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                            ${canLaunch && !isLaunching && !isPublishing
                                ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 shadow-primary/20'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none pointer-events-none'
                            }
                        `}
                    >
                        {isLaunching || isPublishing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{isPublishing ? 'Publishing…' : 'Launching…'}</span>
                            </>
                        ) : (
                            <>
                                <Rocket className="w-5 h-5" />
                                <span>Launch Campaign</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepReviewLaunch;

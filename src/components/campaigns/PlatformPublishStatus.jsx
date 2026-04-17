import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Facebook } from 'lucide-react';

const GoogleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

/**
 * Formats an ISO date string as a relative time label like "3 minutes ago" or "2 days ago".
 */
function formatRelative(isoString) {
    if (!isoString) return null;
    const diff = Date.now() - new Date(isoString).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60)  return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/**
 * PlatformPublishStatus
 *
 * Props:
 *   facebookCampaignId  – string | null
 *   googleCampaignId    – string | null
 *   lastSyncedAt        – ISO date string | null
 */
const PlatformPublishStatus = ({ facebookCampaignId, googleCampaignId, lastSyncedAt }) => {
    const hasFacebook = Boolean(facebookCampaignId);
    const hasGoogle   = Boolean(googleCampaignId);
    const hasAny      = hasFacebook || hasGoogle;
    const relativeSync = formatRelative(lastSyncedAt);

    return (
        <div className="flex flex-wrap items-center gap-3">
            {!hasAny ? (
                <span className="text-xs text-gray-400 italic">Not yet published to any platform</span>
            ) : (
                <>
                    {hasFacebook && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
                            <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                            <span className="text-xs font-medium text-blue-700">Meta Ads</span>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                        </div>
                    )}
                    {hasGoogle && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                            <GoogleIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium text-indigo-700">Google Ads</span>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                        </div>
                    )}
                </>
            )}

            {relativeSync && (
                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    Last synced: {relativeSync}
                </span>
            )}
        </div>
    );
};

export default PlatformPublishStatus;

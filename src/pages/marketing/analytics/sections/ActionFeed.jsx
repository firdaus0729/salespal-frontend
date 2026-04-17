import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Pause,
    Search,
    ArrowUpRight,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';

/**
 * Priority Alerts — Decision-First Action Feed
 * 
 * Displays Critical Risks, Warnings, or Opportunities.
 * Max 3 cards. Each action is concise and actionable.
 */

const SEVERITY_CONFIG = {
    critical: {
        cardBg: 'bg-red-50/80',
        border: 'border-red-300',
        iconBg: 'bg-red-100',
        icon: 'text-red-600',
        badge: 'bg-red-600 text-white',
        label: 'CRITICAL',
        btnBg: 'bg-red-600 text-white hover:bg-red-700',
    },
    warning: {
        cardBg: 'bg-amber-50/80',
        border: 'border-amber-300',
        iconBg: 'bg-amber-100',
        icon: 'text-amber-600',
        badge: 'bg-amber-500 text-white',
        label: 'WARNING',
        btnBg: 'bg-amber-500 text-white hover:bg-amber-600',
    },
    opportunity: {
        cardBg: 'bg-emerald-50/60',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        badge: 'bg-emerald-600 text-white',
        label: 'OPPORTUNITY',
        btnBg: 'bg-emerald-600 text-white hover:bg-emerald-700',
    }
};

const ACTION_ICONS = {
    burn: TrendingDown,
    spike: AlertTriangle,
    opportunity: TrendingUp
};

const ActionCard = ({ alert, navigate }) => {
    const severity = alert.type === 'burn' ? 'critical' :
        alert.type === 'spike' ? 'warning' : 'opportunity';
    const config = SEVERITY_CONFIG[severity];
    const Icon = ACTION_ICONS[alert.type] || AlertTriangle;

    // CTA routing logic
    const handleCTA = () => {
        if (alert.actionLabel === 'Pause Campaign' && alert.campaignId) {
            navigate(`/marketing/campaigns/${alert.campaignId}`);
        } else if (alert.actionLabel === 'Investigate' || alert.actionLabel === 'Check Ad Groups') {
            navigate('/marketing/campaigns');
        } else if (alert.actionLabel === 'Increase Budget' && alert.campaignId) {
            navigate(`/marketing/campaigns/${alert.campaignId}`);
        } else if (alert.onAction) {
            alert.onAction();
        }
    };

    return (
        <div className={`px-4 py-3 rounded-xl border ${config.cardBg} ${config.border} flex items-center gap-3 transition-all hover:shadow-md`}>
            {/* Icon */}
            <div className={`p-2 rounded-lg ${config.iconBg} shrink-0`}>
                <Icon className={`w-4 h-4 ${config.icon}`} />
            </div>

            {/* Content — Single line layout */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${config.badge} tracking-wider`}>
                        {config.label}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm truncate">{alert.title}</h4>
                </div>
                <p className="text-xs text-gray-600 truncate leading-snug">
                    {alert.message}
                </p>
            </div>

            {/* CTA Button */}
            <button
                onClick={handleCTA}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm shrink-0 ${config.btnBg}`}
            >
                {alert.actionLabel === 'Pause Campaign' && <Pause className="w-3 h-3" />}
                {(alert.actionLabel === 'Investigate' || alert.actionLabel === 'Check Ad Groups') && <Search className="w-3 h-3" />}
                {alert.actionLabel === 'Shift Budget' && <ArrowUpRight className="w-3 h-3" />}
                {alert.actionLabel || 'Action'}
            </button>
        </div>
    );
};

const ActionFeed = ({ alerts = [] }) => {
    const navigate = useNavigate();

    // If no alerts, show slim healthy status bar
    if (!alerts || alerts.length === 0) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                    All campaigns operating within healthy thresholds.
                </p>
            </div>
        );
    }

    // Priority sort: Critical > Warning > Opportunity
    const priorityOrder = { burn: 0, spike: 1, opportunity: 2 };
    const sortedAlerts = [...alerts]
        .sort((a, b) => (priorityOrder[a.type] ?? 99) - (priorityOrder[b.type] ?? 99))
        .slice(0, 3); // Max 3 cards

    // Check if any critical alert exists
    const hasCritical = sortedAlerts.some(a => a.type === 'burn');
    const title = sortedAlerts.length === 1 ? 'Priority Alert' : 'Priority Alerts';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-4 h-4 ${hasCritical ? 'text-red-500' : 'text-amber-500'}`} />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${hasCritical ? 'text-red-600' : 'text-gray-500'}`}>
                        {title}
                    </h3>
                </div>
                <span className="text-xs text-gray-400">
                    {sortedAlerts.length} of {alerts.length} shown
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {sortedAlerts.map((alert, index) => (
                    <ActionCard key={index} alert={alert} navigate={navigate} />
                ))}
            </div>
        </div>
    );
};

export default ActionFeed;

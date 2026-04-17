import React, { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    Calendar,
    PauseCircle,
    PlayCircle,
    AlertCircle,
    CreditCard,
    ChevronRight,
    RefreshCw,
    TrendingUp,
    AlertTriangle,
    Zap
} from 'lucide-react';
import Button from '../ui/Button';
import UsageProgress from './UsageProgress';
import { PauseSubscriptionModal, CancelSubscriptionModal } from './ActionModals';
import { motion } from 'framer-motion';
import { usePreferences } from '../../context/PreferencesContext';

const PlanCard = ({ moduleKey, label, subData, config, onPause, onResume, onCancel, icon: Icon, color }) => {
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const { formatCurrency } = usePreferences();

    const isActive = subData?.status === 'active' || subData?.status === 'trial';
    const isPaused = subData?.status === 'paused';
    const isCancelled = subData?.status === 'cancelled';

    const isVisuallyActive = isActive || isCancelled;
    const isInactive = !subData || (!isActive && !isPaused && !isCancelled);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renewalDate = formatDate(subData?.renewalDate);
    const pausedUntilDate = formatDate(subData?.pausedUntil);
    const cancellationDate = formatDate(subData?.cancellationDate);

    const calculateOverallUsage = () => {
        if (!config?.limits || !subData?.usage) return 0;
        const usageValues = Object.entries(config.limits).map(([key, limit]) => {
            const used = subData.usage[key] || 0;
            return (used / limit) * 100;
        });
        if (usageValues.length === 0) return 0;
        return Math.max(...usageValues);
    };

    const overallUsage = calculateOverallUsage();

    const StatusBadge = () => {
        if (isActive) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Active
                </span>
            );
        }
        if (isPaused) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                    <PauseCircle className="w-3.5 h-3.5 mr-1.5" />
                    Paused
                </span>
            );
        }
        if (isCancelled) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Cancelled
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                Not Active
            </span>
        );
    };

    const getColorClasses = (colorName) => {
        const colors = {
            blue: { bg: 'bg-blue-500', shadow: 'shadow-blue-200', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
            green: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-200', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
            purple: { bg: 'bg-purple-500', shadow: 'shadow-purple-200', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
            orange: { bg: 'bg-orange-500', shadow: 'shadow-orange-200', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
            indigo: { bg: 'bg-indigo-600', shadow: 'shadow-indigo-200', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
            gray: { bg: 'bg-gray-500', shadow: 'shadow-gray-200', light: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
        };
        return colors[colorName] || colors.gray;
    };

    const colorConfig = getColorClasses(color);
    const iconBgClass = isActive || isPaused || isCancelled ? `${colorConfig.bg} ${colorConfig.shadow}` : 'bg-gray-200';

    const UsageInsightBanner = () => {
        if (!isActive || overallUsage < 70) return null;

        if (overallUsage >= 90) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-4"
                >
                    <div className="p-1.5 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-800">Critical: Usage at {Math.round(overallUsage)}%</p>
                        <p className="text-xs text-red-600">Upgrade now to avoid service interruption</p>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4"
            >
                <div className="p-1.5 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-amber-800">High usage: {Math.round(overallUsage)}%</p>
                    <p className="text-xs text-amber-600">Consider upgrading for more capacity</p>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`
                    relative bg-white rounded-2xl border flex flex-col h-full overflow-hidden
                    transition-all duration-300 ease-out group
                    hover:shadow-xl hover:-translate-y-1
                    ${isVisuallyActive ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm bg-gray-50/30'}
                `}
            >
                <div className="p-6 flex-1 flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            {Icon && (
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${iconBgClass} transition-all duration-300 group-hover:scale-105`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                            )}
                            <div>
                                <h3 className={`text-lg font-bold ${isInactive ? 'text-gray-500' : 'text-gray-900'} leading-tight mb-2`}>
                                    {label}
                                </h3>
                                <StatusBadge />
                            </div>
                        </div>
                    </div>

                    {!isInactive && (
                        <div className="mb-6">
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-bold text-gray-900">
                                    {formatCurrency(subData?.price ?? config?.price ?? 9999)}
                                </span>
                                <span className="text-gray-500 text-sm font-medium">/month</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {isPaused ? (
                                    <span>Paused until <span className="font-medium text-gray-700">{pausedUntilDate || 'resumed'}</span></span>
                                ) : isCancelled ? (
                                    <span>Access until <span className="font-medium text-gray-700">{cancellationDate || renewalDate}</span></span>
                                ) : (
                                    <span>Renews <span className="font-medium text-gray-700">{renewalDate}</span></span>
                                )}
                            </div>
                        </div>
                    )}

                    <UsageInsightBanner />

                    {isActive && config?.limits && (
                        <div className="mb-6 space-y-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Usage Overview</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    overallUsage >= 90 ? 'bg-red-100 text-red-700' :
                                    overallUsage >= 70 ? 'bg-amber-100 text-amber-700' :
                                    'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {Math.round(overallUsage)}% used
                                </span>
                            </div>
                            {Object.entries(config.limits).map(([limitKey, limitVal]) => {
                                const used = subData?.usage?.[limitKey] || 0;
                                return (
                                    <UsageProgress
                                        key={limitKey}
                                        label={limitKey}
                                        used={used}
                                        limit={limitVal}
                                        color={color || 'blue'}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {isPaused && (
                        <div className="mb-6 py-6 text-center rounded-xl bg-amber-50 border border-amber-100 border-dashed">
                            <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                                <PauseCircle className="w-6 h-6 text-amber-500" />
                            </div>
                            <h4 className="text-amber-900 font-semibold text-sm mb-1">Subscription Paused</h4>
                            <p className="text-xs text-amber-700/80 px-4">Billing is paused. Resume to access features.</p>
                        </div>
                    )}

                    {isCancelled && (
                        <div className="mb-6 py-4 px-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Cancellation Scheduled</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        You still have access until the end of the billing cycle. Reactivate anytime to keep your data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isInactive && (
                        <div className="mb-6 space-y-4">
                            <div className={`p-4 rounded-xl ${colorConfig.light} border ${colorConfig.border}`}>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Unlock powerful features to supercharge your workflow.
                                    Get started today with our flexible plans.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Zap className="w-4 h-4" />
                                <span>Instant activation</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-4 space-y-3">
                        {isActive && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="justify-center text-gray-600 font-medium hover:text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    onClick={() => setShowPauseModal(true)}
                                >
                                    <PauseCircle className="w-4 h-4 mr-2 text-gray-400" />
                                    Pause
                                </Button>
                                <Button
                                    variant="outline"
                                    className="justify-center text-red-600 font-medium border-red-100 hover:border-red-200 hover:bg-red-50 transition-all"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}

                        {isPaused && (
                            <Button
                                className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                                onClick={onResume}
                            >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Resume Subscription
                            </Button>
                        )}

                        {isCancelled && (
                            <Button
                                variant="outline"
                                className="w-full justify-center text-blue-600 font-semibold border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 shadow-sm transition-all"
                                onClick={onResume}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Re-Subscribe
                            </Button>
                        )}

                        {isInactive && (
                            <Button
                                className="w-full justify-center bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-300 transition-all transform hover:-translate-y-0.5"
                                onClick={() => window.location.href = '/#pricing'}
                            >
                                Purchase Plan <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            <PauseSubscriptionModal
                isOpen={showPauseModal}
                onClose={() => setShowPauseModal(false)}
                onConfirm={(months) => {
                    setShowPauseModal(false);
                    onPause(months);
                }}
                planName={label}
                renewalDate={subData?.renewalDate}
            />

            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                    setShowCancelModal(false);
                    onCancel();
                }}
                planName={label}
                renewalDate={subData?.renewalDate}
            />
        </>
    );
};

export default PlanCard;

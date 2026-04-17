import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { MODULES } from '../../commerce/commerce.config';
import { Megaphone, Phone, UserCheck, Headphones, ExternalLink, Layers } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import PlanCard from '../../components/subscription/PlanCard';
import OverviewBar from '../../components/subscription/OverviewBar';
import Upsell360Section from '../../components/subscription/Upsell360Section';
import PlanComparisonTable from '../../components/subscription/PlanComparisonTable';
import { motion } from 'framer-motion';

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const {
        subscriptions,
        deactivateSubscription,
        pauseSubscription,
        resumeSubscription
    } = useSubscription();
    const { addToast } = useToast();

    const MODULE_CONFIG = {
        marketing: { icon: Megaphone, color: 'blue' },
        sales: { icon: Phone, color: 'green' },
        postSale: { icon: UserCheck, color: 'purple' },
        support: { icon: Headphones, color: 'orange' },
        salespal360: { icon: Layers, color: 'indigo' }
    };

    const modulesList = [
        { key: 'marketing', label: 'Marketing Plan' },
        { key: 'sales', label: 'Sales Plan' },
        { key: 'postSale', label: 'Post-Sales Plan' },
        { key: 'support', label: 'Support Plan' },
        { key: 'salespal360', label: 'SalesPal 360' }
    ];

    const salespal360Sub = subscriptions?.['salespal360'];
    const hasSalesPal360 = salespal360Sub?.status === 'active' || salespal360Sub?.status === 'trial';

    const normalizedSubscriptions = useMemo(() => {
        if (!subscriptions) return {};

        const normalized = {};
        Object.keys(subscriptions).forEach((moduleKey) => {
            const sub = subscriptions[moduleKey];
            if (hasSalesPal360 && moduleKey !== 'salespal360') {
                normalized[moduleKey] = {
                    ...sub,
                    status: 'inactive'
                };
            } else {
                normalized[moduleKey] = sub;
            }
        });
        return normalized;
    }, [subscriptions, hasSalesPal360]);

    const activePlansCount = hasSalesPal360
        ? 1
        : Object.values(normalizedSubscriptions).filter(
            (sub) => sub?.status === 'active' || sub?.status === 'trial'
        ).length;

    const showUpsell = !hasSalesPal360 && activePlansCount >= 2;

    const handleCancel = (moduleId, moduleName) => {
        deactivateSubscription(moduleId);
        addToast(`Subscription for ${moduleName} cancelled. Access remains until end of cycle.`, 'info');
    };

    const handlePause = (moduleId, months) => {
        pauseSubscription(moduleId, months);
        addToast('Subscription paused successfully.', 'success');
    };

    const handleResume = (moduleId) => {
        resumeSubscription(moduleId);
        addToast('Subscription resumed.', 'success');
    };

    const handleUpgrade = () => {
        window.location.href = '/#pricing';
    };

    const handleExploreFeatures = () => {
        window.location.href = '/products/salespal-360';
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 tracking-tight"
                    >
                        Subscription Management
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 mt-2 text-lg"
                    >
                        Manage your active plans, usage, and billing status.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button 
                        variant="outline" 
                        className="text-gray-600 border-gray-300 hover:border-gray-400"
                        onClick={() => navigate('/profile?tab=billing')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Billing Portal
                    </Button>
                </motion.div>
            </div>

            <div className="space-y-6">
                <OverviewBar
                    activeCount={activePlansCount}
                    hasSalesPal360={hasSalesPal360}
                    onUpgrade={handleUpgrade}
                    onExplore={handleExploreFeatures}
                />

                <Upsell360Section
                    show={showUpsell}
                    onSwitch={handleUpgrade}
                />

                <div>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-semibold text-gray-900 mb-4"
                    >
                        Your Plans
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modulesList.filter(m => m.key !== 'salespal360').map((mod, index) => {
                            const subData = normalizedSubscriptions[mod.key];
                            const config = MODULES[mod.key] || {};
                            const { icon: Icon, color } = MODULE_CONFIG[mod.key] || { icon: Layers, color: 'gray' };

                            return (
                                <motion.div
                                    key={mod.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                >
                                    <PlanCard
                                        moduleKey={mod.key}
                                        label={mod.label}
                                        subData={subData}
                                        config={config}
                                        icon={Icon}
                                        color={color}
                                        onPause={months => handlePause(mod.key, months)}
                                        onResume={() => handleResume(mod.key)}
                                        onCancel={() => handleCancel(mod.key, mod.label)}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6"
                    >
                        <PlanCard
                            moduleKey="salespal360"
                            label="SalesPal 360"
                            subData={normalizedSubscriptions['salespal360']}
                            config={MODULES['salespal360'] || {}}
                            icon={MODULE_CONFIG['salespal360'].icon}
                            color={MODULE_CONFIG['salespal360'].color}
                            onPause={months => handlePause('salespal360', months)}
                            onResume={() => handleResume('salespal360')}
                            onCancel={() => handleCancel('salespal360', 'SalesPal 360')}
                        />
                    </motion.div>
                </div>

                <PlanComparisonTable />

                <div className="text-center border-t border-gray-100 pt-8 mt-8">
                    <p className="text-sm text-gray-500">
                        Need help with your invoice?{' '}
                        <a href="#" className="text-blue-600 font-medium hover:underline">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;

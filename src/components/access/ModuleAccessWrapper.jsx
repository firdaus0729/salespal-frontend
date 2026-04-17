import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../commerce/SubscriptionContext';
import { usePricing } from '../../context/PricingContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import { 
    Lock, 
    ArrowRight, 
    ShieldCheck, 
    Wrench, 
    AlertCircle, 
    Clock, 
    MessageCircle 
} from 'lucide-react';
import Button from '../ui/Button';
import { useMaintenance } from '../../context/MaintenanceContext';
import ModuleMaintenanceCard from '../maintenance/ModuleMaintenanceCard';

const ModuleAccessWrapper = ({ moduleName, children, title = 'Module Locked' }) => {
    const { isModuleActive, loading } = useSubscription();
    const { isModuleUnderMaintenance, getModuleMaintenanceInfo } = useMaintenance();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mapping for subscription key (moduleName from router → subscription key matching MODULES)
    const subscriptionKeyMap = {
        marketing: 'marketing',
        sales: 'sales',
        postSale: 'postSale',  // ✅ Match MODULES config key
        'post-sales': 'postSale',  // ✅ Handle router path variant
        support: 'support',
    };

    const subscriptionKey = subscriptionKeyMap[moduleName] || moduleName;

    // Mapping for friendlier display names
    const moduleDisplayNames = {
        marketing: 'Marketing Intelligence',
        sales: 'Sales Engine',
        postSale: 'Post-Sales Automation',
        'post-sales': 'Post-Sales Automation',
        support: 'Support Hub',
    };

    const displayName = moduleDisplayNames[moduleName] || moduleName || 'Plan';
    
    // Admins bypass maintenance mode
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-100 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    // ─── Maintenance check (before subscription check) ───────────────────
    // Map moduleNaame to maintenance key (handles both "postSale" from router and mapping to "post-sales")
    const maintenanceKeyMap = {
        marketing: 'marketing',
        sales: 'sales',
        postSale: 'post-sales',  // ✅ Correctly maps to maintenance context key
        'post-sales': 'post-sales',
        support: 'support',
    };
    const maintenanceKey = maintenanceKeyMap[moduleName] || moduleName;

    if (isModuleUnderMaintenance(maintenanceKey)) {
        const info = getModuleMaintenanceInfo(maintenanceKey);
        return (
            <ModuleMaintenanceCard
                moduleName={maintenanceKey}
                reason={info.reason}
                eta={info.eta}
                isAdmin={isAdmin}
            />
        );
    }

    // Check if user has the active module using subscription key
    const hasAccess = isModuleActive(subscriptionKey);

    if (hasAccess) {
        return children;
    }

    // Locked UI
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#f9fafb] p-6 animate-fade-in-up">
            <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.04)] border border-gray-100 max-w-2xl w-full text-center relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                    <Lock className="w-10 h-10 text-gray-400" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">
                    {displayName} Locked
                </h1>

                <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                    Upgrade your organization's plan to unlock the full potential of <span className="text-gray-900">{displayName}</span> and accelerate your revenue growth.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                        onClick={() => {
                            window.location.href = '/#pricing';
                        }}
                        className="w-full py-4 text-base font-bold bg-linear-to-r from-blue-600 to-blue-700 hover:opacity-90 shadow-lg shadow-blue-500/20"
                    >
                        Unlock Features
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/contact')}
                        className="w-full py-4 text-base font-bold border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Book a Demo
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Enterprise Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleAccessWrapper;

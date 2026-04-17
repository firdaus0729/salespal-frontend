import React from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { OrgProvider } from '../context/OrgContext';
import { SubscriptionProvider } from '../commerce/SubscriptionContext';
import { CartProvider } from '../commerce/CartContext';
import { MarketingProvider } from '../context/MarketingContext';
import { ProjectProvider } from '../context/ProjectContext';
import { IntegrationProvider } from '../context/IntegrationContext';
import { SalesProvider } from '../context/SalesContext';
import { PostSalesProvider } from '../context/PostSalesContext';
import MiniCartDrawer from '../components/cart/MiniCartDrawer';
import { ToastProvider } from '../components/ui/Toast';
import ScrollToTop from '../components/common/ScrollToTop';
import { PreferencesProvider } from '../context/PreferencesContext';
import { NotificationProvider } from '../context/NotificationContext';
import { PricingProvider } from '../context/PricingContext';
import { MaintenanceProvider, useMaintenance } from '../context/MaintenanceContext';
import GlobalMaintenancePage from '../components/maintenance/GlobalMaintenancePage';

/**
 * Root-level maintenance guard.
 * When global maintenance is ON, ALL users see the maintenance page — including admins.
 * The only exception is /admin/* routes so admins can still manage settings.
 */
const MaintenanceGuard = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const { isGlobalMaintenance, loading: maintenanceLoading } = useMaintenance();
    const location = useLocation();

    // Wait for both auth and maintenance status to load
    if (authLoading || maintenanceLoading) {
        return children;
    }

    const isAdmin = user?.role === 'admin';
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Admins can always access /admin/* routes to manage maintenance
    if (isGlobalMaintenance && isAdmin && !isAdminRoute) {
        return <GlobalMaintenancePage isAdmin />;
    }

    // Block everything for non-admin users during global maintenance
    if (isGlobalMaintenance && !isAdmin) {
        return <GlobalMaintenancePage />;
    }

    return children;
};

const App = () => {
    return (
        <PreferencesProvider>
            <PricingProvider>
                <AuthProvider>
                <MaintenanceProvider>
                <OrgProvider>
                    <SubscriptionProvider>
                        <CartProvider>
                            <IntegrationProvider>
                                <SalesProvider>
                                    <MarketingProvider>
                                        <ProjectProvider>
                                            <PostSalesProvider>
                                                <NotificationProvider>
                                                    <ToastProvider>
                                                        <ScrollRestoration />
                                                        <ScrollToTop />
                                                        <MaintenanceGuard>
                                                            <Outlet />
                                                            <MiniCartDrawer />
                                                        </MaintenanceGuard>
                                                    </ToastProvider>
                                                </NotificationProvider>
                                            </PostSalesProvider>
                                        </ProjectProvider>
                                    </MarketingProvider>
                                </SalesProvider>
                            </IntegrationProvider>
                        </CartProvider>
                    </SubscriptionProvider>
                </OrgProvider>
                </MaintenanceProvider>
            </AuthProvider>
            </PricingProvider>
        </PreferencesProvider>
    );
};

export default App;


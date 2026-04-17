import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../../commerce/SubscriptionContext';

const ModuleAccessGuard = ({ moduleName, children }) => {
    const { isModuleActive, loading } = useSubscription();

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading access rights...</div>;
    }

    // Check if user has the active module
    const hasAccess = isModuleActive(moduleName);

    if (!hasAccess) {
        // Redirect to the product page for this module
        return <Navigate to={`/products/${moduleName}`} replace />;
    }

    return children;
};

export default ModuleAccessGuard;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-[#0D1F2D]/10 border-t-[#0D1F2D] rounded-full animate-spin"></div>
                <p className="text-[#0D1F2D] font-medium tracking-wide animate-pulse">Loading Admin Console...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Temporarily disabled role check for development
    // if (user.role !== 'admin') {
    //     return <Navigate to="/dashboard" replace />;
    // }

    return children;
};

export default AdminRoute;

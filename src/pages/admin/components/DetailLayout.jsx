import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BaseDetailLayout = ({ children, backUrl, backLabel = "Back" }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans mb-10 text-gray-800">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center shrink-0">
                <button
                    onClick={() => navigate(backUrl)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} /> {backLabel}
                </button>
            </div>
            {children}
        </div>
    );
};

export const DetailHeader = ({ title, subtitle, icon: Icon, badge, actions }) => {
    return (
        <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-8 shrink-0">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        {title}
                    </h1>
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2 font-medium">
                        {Icon && <Icon size={15} className="text-gray-400" />}
                        {subtitle}
                        {badge && (
                            <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                                {badge}
                            </>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export const DetailGrid = ({ children }) => {
    return (
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {children}
            </div>
        </div>
    );
};

export const LeftColumn = ({ children }) => {
    return (
        <div className="lg:col-span-8 space-y-6">
            {children}
        </div>
    );
};

export const RightColumn = ({ children }) => {
    return (
        <div className="lg:col-span-4 space-y-6">
            {children}
        </div>
    );
};

export const DetailCard = ({ title, icon: Icon, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 ${className}`}>
            {(title || Icon) && (
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-50">
                    {Icon && <Icon size={18} className="text-gray-400" />}
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
                </div>
            )}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

export const DetailMetric = ({ label, value, subValue }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
    </div>
);

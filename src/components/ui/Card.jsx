import React from 'react';

const Card = ({ children, className = '', noPadding = false, onClick, variant = 'default', ...props }) => {
    const variants = {
        default: "bg-white border-gray-200",
        dark: "bg-[#132B3A] border-white/5"
    };

    const baseStyles = `${variants[variant] || variants.default} border rounded-xl shadow-sm overflow-hidden`;
    const interactiveStyles = onClick ? "cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] transition-transform" : "";

    return (
        <div
            className={`${baseStyles} ${interactiveStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export default Card;

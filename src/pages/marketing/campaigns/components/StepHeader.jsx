import React from 'react';

const StepHeader = ({ title, subtitle }) => {
    return (
        <div className="mb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 mt-2 text-base leading-relaxed">{subtitle}</p>
        </div>
    );
};

export default StepHeader;

import React from 'react';

const StepHeader = ({ title, description }) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">{description}</p>
        </div>
    );
};

export default StepHeader;

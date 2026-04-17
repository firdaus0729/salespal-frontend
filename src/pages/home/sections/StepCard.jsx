import React from 'react';

const StepCard = ({ number, title, description }) => {
    return (
        <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group h-full">
            <div className="text-5xl font-bold text-white/5 mb-4 group-hover:text-secondary/10 transition-colors">
                {number}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
                {title}
            </h3>
            <p className="text-[#A8B3BD] text-sm leading-relaxed">
                {description}
            </p>

            {/* Decorative line */}
            <div className="absolute top-6 right-6 w-8 h-1 bg-secondary/20 rounded-full group-hover:bg-secondary/50 transition-colors"></div>
        </div>
    );
};

export default StepCard;

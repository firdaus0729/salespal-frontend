import React from 'react';

const SectionWrapper = ({ children, className = "", id = "" }) => {
    return (
        <section id={id} className={`w-full py-24 px-6 scroll-mt-28 ${className}`}>
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;

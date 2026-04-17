import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SalesPal360CTA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-20 px-6 bg-gray-50"
        >
            <div className="max-w-4xl mx-auto">
                <div
                    className={`rounded-3xl p-12 md:p-16 text-center transition-all duration-500 ${isVisible ? 'animate-scale-in' : 'opacity-0'
                        }`}
                    style={{
                        background: '#2d3748',
                        boxShadow: '0px 8px 24px rgba(0,0,0,0.12)'
                    }}
                >
                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Ready to Get Started with SalesPal 360?
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                        Try AI Live to see how SalesPal 360 can transform your business.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/demo">
                            <button
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                                style={{
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
                                }}
                            >
                                Book Your Demo
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>

                        <Link to="/#pricing">
                            <button
                                className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:bg-gray-700"
                                style={{
                                    background: 'transparent',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                View Pricing
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-scale-in {
                    animation: scaleIn 0.5s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default SalesPal360CTA;

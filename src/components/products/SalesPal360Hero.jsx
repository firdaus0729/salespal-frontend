import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Zap } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

const SalesPal360Hero = () => {
    const { formatCurrency } = usePreferences();
    const scrollToFeatures = () => {
        const element = document.getElementById('powerful-features');
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
            {/* Subtle radial glow backgrounds */}
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 animate-fade-in-up">
                    {/* Left - Icon */}
                    <div
                        className="shrink-0"
                        style={{
                            animation: 'fadeInUp 0.6s ease-out'
                        }}
                    >
                        <div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                                boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <Layers className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Right - Content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Most Popular Badge */}
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full mb-4">
                            <Zap className="w-4 h-4 fill-current" />
                            <span>Most Popular</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3 tracking-tight">
                            SalesPal 360
                        </h1>

                        <p className="text-xl text-blue-500 font-medium mb-4">
                            Complete AI Revenue System
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mb-6">
                            {formatCurrency(29999)}<span className="text-lg font-normal text-gray-600">/month</span>
                        </p>

                        <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-2xl">
                            Why use multiple tools when you can have one unified AI workforce? SalesPal 360 combines Marketing, Sales, Post Sales, and Support into a seamless revenue automation platform.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
                                    Try AI Live
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>

                            <button
                                onClick={scrollToFeatures}
                                className="px-6 py-3 rounded-xl font-semibold transition-all hover:bg-blue-50"
                                style={{
                                    background: 'transparent',
                                    border: '2px solid #3b82f6',
                                    color: '#1f2937'
                                }}
                            >
                                View Features
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out;
                }
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </section>
    );
};

export default SalesPal360Hero;

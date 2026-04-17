import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Megaphone, ArrowRight } from 'lucide-react';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import useReducedMotion from '../../hooks/useReducedMotion';
import { usePreferences } from '../../context/PreferencesContext';

const ProductHero = () => {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const { formatCurrency } = usePreferences();

    const scrollToFeatures = () => {
        const element = document.getElementById('powerful-features');
        if (element) {
            const offset = 80; // Navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const iconVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-6xl mx-auto">
                <StaggerContainer className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left - Icon */}
                    <motion.div
                        className="shrink-0"
                        variants={prefersReducedMotion ? {} : iconVariants}
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.25)'
                            }}
                        >
                            <Megaphone className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                    </motion.div>

                    {/* Right - Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <StaggerItem>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                                SalesPal Marketing
                            </h1>
                        </StaggerItem>

                        <StaggerItem>
                            <p className="text-lg text-blue-500 font-medium mb-4">
                                AI-Powered Content & Campaigns
                            </p>
                        </StaggerItem>

                        <StaggerItem>
                            <p className="text-3xl font-bold text-gray-900 mb-6">
                                {formatCurrency(5999)}<span className="text-lg font-normal text-gray-600">/month</span>
                            </p>
                        </StaggerItem>

                        <StaggerItem>
                            <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-2xl">
                                Stop spending hours on ad creative and campaign optimization. SalesPal Marketing uses AI to generate high-converting ads, run continuous A/B tests, and automatically route qualified leads to your sales team.
                            </p>
                        </StaggerItem>

                        {/* Buttons */}
                        <StaggerItem>
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
                        </StaggerItem>
                    </div>
                </StaggerContainer>
            </div>
        </section>
    );
};

export default ProductHero;

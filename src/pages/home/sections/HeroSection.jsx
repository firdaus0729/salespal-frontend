import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Megaphone, Phone, Users, Headphones, Star, UserCheck } from 'lucide-react';
import Button from '../../../components/ui/Button';
import FloatingElement from '../../../components/animations/FloatingElement';
import AnimatedButton from '../../../components/ui/AnimatedButton';
import useReducedMotion from '../../../hooks/useReducedMotion';

const HeroSection = () => {
    const prefersReducedMotion = useReducedMotion();

    const orbitCards = [
        {
            icon: Megaphone,
            label: 'Marketing',
            iconBg: 'bg-blue-500',
            position: 'top-[72px] left-[72px]'
        },
        {
            icon: Phone,
            label: 'Sales',
            iconBg: 'bg-green-500',
            position: 'top-[72px] right-[72px]'
        },
        {
            icon: UserCheck,
            label: 'Post-Sale',
            iconBg: 'bg-yellow-500',
            position: 'bottom-[72px] left-[72px]'
        },
        {
            icon: Headphones,
            label: 'Support',
            iconBg: 'bg-red-500',
            position: 'bottom-[72px] right-[72px]'
        },
    ];

    // Animation variants for staggered content
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <section className="relative pt-16 pb-20 px-6 overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"
                animate={prefersReducedMotion ? {} : {
                    backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear'
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <motion.div
                        className="text-left"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Top badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                            style={{
                                background: 'rgba(29, 124, 255, 0.10)',
                                border: '1px solid rgba(29, 124, 255, 0.22)',
                                color: '#0B5DDA'
                            }}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Revenue Automation
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
                        >
                            The World's First
                            <br />
                            <span style={{
                                background: 'linear-gradient(90deg, #1D7CFF 0%, #073B8F 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>AI Workforce</span> for
                            <br />
                            Revenue Automation
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl"
                        >
                            Replace manual marketing, sales & support with human-like AI. Zero missed follow-ups. 24×7 availability. Real revenue growth.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row items-start gap-4"
                        >
                            <Link to="/demo">
                                <AnimatedButton variant="primary">
                                    Try AI Live
                                    <ArrowRight className="w-4 h-4" />
                                </AnimatedButton>
                            </Link>
                            <AnimatedButton
                                variant="secondary"
                                className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:border-transparent hover:text-white transition-all duration-300"
                                onClick={() => {
                                    const element = document.getElementById('modules');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                Explore Products
                            </AnimatedButton>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Orbit Graphic */}
                    <div className="relative h-[500px] hidden lg:block">
                        {/* Background glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-100/50 rounded-full blur-3xl"></div>

                        {/* Orbit rings - 2 dashed circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px]">
                            {/* Outer dashed circle */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200/60"></div>
                            {/* Inner dashed circle */}
                            <div className="absolute inset-16 rounded-full border-2 border-dashed border-blue-200/60"></div>
                        </div>

                        {/* Center Circle - SalesPal 360 with floating animation */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                            initial={prefersReducedMotion ? {} : { scale: 0.96, opacity: 0 }}
                            animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                            <FloatingElement distance={6} duration={5}>
                                {/* Glow effect behind center */}
                                <div className="absolute inset-0 w-28 h-28 bg-blue-500/30 rounded-full blur-2xl"></div>

                                {/* Center circle */}
                                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-white font-bold text-base">SalesPal</div>
                                        <div className="text-white text-2xl font-bold">360</div>
                                    </div>
                                </div>
                            </FloatingElement>
                        </motion.div>

                        {/* Floating Product Cards - positioned to match first screenshot */}
                        {orbitCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className={`absolute ${card.position} z-10`}
                                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.5 + (index * 0.1),
                                        ease: [0.25, 0.1, 0.25, 1]
                                    }}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-200 backdrop-blur-sm shadow-lg animate-float"
                                        style={{ animationDelay: `${index * 0.5}s` }}
                                    >
                                        <div className={`w-9 h-9 ${card.iconBg} rounded-md flex items-center justify-center`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-medium text-base whitespace-nowrap text-gray-900">{card.label}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Mobile Orbit Graphic */}
                    <div className="relative h-80 lg:hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                            <div className="absolute inset-0 rounded-full border border-blue-200/60"></div>
                            <div className="absolute inset-8 rounded-full border border-blue-200/60"></div>
                        </div>

                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                            initial={prefersReducedMotion ? {} : { scale: 0.96, opacity: 0 }}
                            animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <FloatingElement distance={4} duration={5}>
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-white/10 shadow-2xl flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-white font-bold text-sm">SalesPal</div>
                                        <div className="text-white text-lg font-bold">360</div>
                                    </div>
                                </div>
                            </FloatingElement>
                        </motion.div>

                        {orbitCards.map((card, index) => {
                            const Icon = card.icon;
                            const mobilePositions = [
                                'top-8 left-1/2 -translate-x-1/2',
                                'top-1/2 right-4 -translate-y-1/2',
                                'bottom-8 left-1/2 -translate-x-1/2',
                                'top-1/2 left-4 -translate-y-1/2'
                            ];
                            return (
                                <motion.div
                                    key={index}
                                    className={`absolute ${mobilePositions[index]} z-10`}
                                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.5 + (index * 0.1)
                                    }}
                                >
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 backdrop-blur-sm shadow-lg animate-float"
                                        style={{ animationDelay: `${index * 0.5}s` }}
                                    >
                                        <div className={`w-7 h-7 ${card.iconBg} rounded-md flex items-center justify-center`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium text-sm whitespace-nowrap text-gray-900">{card.label}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;

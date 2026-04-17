import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Target, Zap, BarChart3, Share2, TrendingUp } from 'lucide-react';
import { ScrollRevealHeading, ScrollRevealSubheading } from '../animations/ScrollReveal';
import useScrollReveal from '../../hooks/useScrollReveal';
import useReducedMotion from '../../hooks/useReducedMotion';

const features = [
    {
        icon: Bot,
        title: "AI Ad Creative Generation",
        description: "Generate multiple ad variations in seconds. Our AI understands what works for your industry."
    },
    {
        icon: Target,
        title: "Automatic A/B Testing",
        description: "Continuous testing and optimization. AI learns what converts and allocates budget accordingly."
    },
    {
        icon: Zap,
        title: "Smart Lead Routing",
        description: "Qualified leads are instantly routed to the right salesperson based on criteria you define."
    },
    {
        icon: BarChart3,
        title: "Campaign Analytics",
        description: "Deep insights into what's working. Track cost per lead, conversion rates, and ROI in real-time."
    },
    {
        icon: Share2,
        title: "Multi-Channel Support",
        description: "Run campaigns across Facebook, Instagram, Google, and LinkedIn from one dashboard."
    },
    {
        icon: TrendingUp,
        title: "Budget Optimization",
        description: "AI automatically adjusts budgets to maximize conversions within your spend limits."
    }
];

const FeaturesGrid = () => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.65,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <section
            id="powerful-features"
            className="py-20 px-6 bg-white"
            style={{ scrollMarginTop: '80px' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <ScrollRevealHeading>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                            Powerful Features
                        </h2>
                    </ScrollRevealHeading>
                    <ScrollRevealSubheading>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Everything you need to automate and scale your revenue operations.
                        </p>
                    </ScrollRevealSubheading>
                </div>

                {/* Features Grid */}
                <motion.div
                    ref={ref}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={prefersReducedMotion ? {} : containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                className="p-6 bg-white rounded-2xl border border-gray-100"
                                style={{
                                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
                                }}
                                variants={prefersReducedMotion ? {} : itemVariants}
                                whileHover={prefersReducedMotion ? {} : {
                                    y: -6,
                                    scale: 1.01,
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                    boxShadow: '0px 24px 48px rgba(0,0,0,0.15)',
                                    transition: {
                                        duration: 0.25,
                                        ease: [0.22, 1, 0.36, 1]
                                    }
                                }}
                            >
                                {/* Icon Container */}
                                <motion.div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.1)'
                                    }}
                                    whileHover={prefersReducedMotion ? {} : {
                                        scale: 1.06,
                                        rotate: 2,
                                        boxShadow: '0px 8px 20px rgba(59, 130, 246, 0.3)',
                                        transition: {
                                            duration: 0.2,
                                            ease: [0.22, 1, 0.36, 1]
                                        }
                                    }}
                                >
                                    <Icon className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                                </motion.div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesGrid;

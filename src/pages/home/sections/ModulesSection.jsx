import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { ArrowRight, Layers } from 'lucide-react';
import { modules as allModules } from '../../../data/homepageData';
import { ScrollRevealHeading, ScrollRevealSubheading } from '../../../components/animations/ScrollReveal';
import useScrollReveal from '../../../hooks/useScrollReveal';
import useReducedMotion from '../../../hooks/useReducedMotion';
import { usePricing } from '../../../context/PricingContext';

const ModulesSection = () => {
    const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: salespal360Ref, isVisible: salespal360Visible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();
    const { isModuleVisible } = usePricing();

    const modules = allModules.filter(m => isModuleVisible(m.id));

    // Stagger animation variants for cards
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

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 18,
            scale: 0.985
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
        <SectionWrapper id="modules" className="bg-gradient-to-b from-white to-gray-50">
            <div className="text-center mb-16">
                <ScrollRevealHeading>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        5 AI Products. <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">One Mission.</span>
                    </h2>
                </ScrollRevealHeading>
                <ScrollRevealSubheading>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        From the first ad to loyal customer, SalesPal automates every touchpoint in your revenue journey.
                    </p>
                </ScrollRevealSubheading>
            </div>

            {modules.length > 0 && (
                <motion.div
                    ref={cardsRef}
                    className={`grid md:grid-cols-2 gap-6 mb-12 ${
                        modules.length === 1 ? 'lg:grid-cols-1 max-w-sm mx-auto' :
                        modules.length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' :
                        modules.length === 3 ? 'lg:grid-cols-3 max-w-6xl mx-auto' :
                        'lg:grid-cols-4'
                    }`}
                    variants={prefersReducedMotion ? {} : containerVariants}
                    initial="hidden"
                    animate={cardsVisible ? "visible" : "hidden"}
                >
                    {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <motion.div
                            key={module.id}
                            variants={prefersReducedMotion ? {} : cardVariants}
                            className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-md"
                            whileHover={prefersReducedMotion ? {} : {
                                y: -6,
                                scale: 1.01,
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                                transition: {
                                    duration: 0.25,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                        >
                            <motion.div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{
                                    background: module.id === 'marketing' ? '#3b82f6' :
                                        module.id === 'sales' ? '#22c55e' :
                                            module.id === 'postsale' ? '#f59e0b' :
                                                '#ef4444',
                                    boxShadow: '0px 6px 16px rgba(0,0,0,0.08)'
                                }}
                                whileHover={prefersReducedMotion ? {} : {
                                    scale: 1.06,
                                    rotate: 2,
                                    boxShadow: module.id === 'marketing' ? '0px 10px 24px rgba(59, 130, 246, 0.5)' :
                                        module.id === 'sales' ? '0px 10px 24px rgba(34, 197, 94, 0.5)' :
                                            module.id === 'postsale' ? '0px 10px 24px rgba(245, 158, 11, 0.5)' :
                                                '0px 10px 24px rgba(239, 68, 68, 0.5)',
                                    transition: {
                                        duration: 0.2,
                                        ease: [0.22, 1, 0.36, 1]
                                    }
                                }}
                            >
                                <Icon
                                    className="w-6 h-6"
                                    strokeWidth={2.5}
                                    style={{ color: '#ffffff' }}
                                />
                            </motion.div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900">{module.title}</h3>
                            <p className="text-sm font-medium text-gray-700 mb-3">{module.subtitle}</p>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{module.description}</p>

                            <Link to={
                                module.id === 'marketing' ? '/products/marketing' :
                                    module.id === 'sales' ? '/products/sales' :
                                        module.id === 'postsale' ? '/products/post-sale' :
                                            module.id === 'support' ? '/products/support' :
                                                '#'
                            }>
                                <motion.button
                                    className="text-gray-700 bg-white border border-gray-300 hover:border-blue-500 px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1 transition-colors duration-250"
                                    whileHover={prefersReducedMotion ? {} : {
                                        scale: 1.02,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#3b82f6';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#ffffff';
                                        e.currentTarget.style.color = '#374151';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    Learn More
                                    <motion.span
                                        whileHover={prefersReducedMotion ? {} : {
                                            x: 3,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                </motion.button>
                            </Link>
                        </motion.div>
                    );
                })}
                </motion.div>
            )}

            {/* SalesPal 360 Section */}
            <motion.div
                ref={salespal360Ref}
                className="relative"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={salespal360Visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {/* Best Value Badge */}
                <div className="absolute -top-3 right-6 z-10">
                    <div className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg">
                        <span>⭐</span>
                        <span>Best Value</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left side - Icon and Content */}
                        <div className="flex items-start gap-6 flex-1">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shrink-0 shadow-lg">
                                <Layers className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">SalesPal 360</h3>
                                <p className="text-base font-medium text-gray-700 mb-3">Complete AI Revenue System</p>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                                    All 4 products unified into one powerful platform. Single customer timeline, shared AI memory, and complete owner control.
                                </p>
                            </div>
                        </div>

                        {/* Right side - Button */}
                        <div className="shrink-0">
                            <Link to="/products/salespal-360">
                                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    Learn More
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </SectionWrapper>
    );
};

export default ModulesSection;

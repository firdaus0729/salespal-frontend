import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { problems } from '../../../data/homepageData';
import { ScrollRevealHeading, ScrollRevealSubheading } from '../../../components/animations/ScrollReveal';
import useScrollReveal from '../../../hooks/useScrollReveal';
import useReducedMotion from '../../../hooks/useReducedMotion';

const WhySalesPal = () => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();

    // Stagger animation variants for problem cards
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
        <SectionWrapper id="about" className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <div className="relative z-10">
                <div className="text-center mb-16">
                    <ScrollRevealHeading>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                            Leads Come, But <span className="text-red-500">Revenue Leaks</span>
                        </h2>
                    </ScrollRevealHeading>
                    <ScrollRevealSubheading>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Every day, potential revenue slips through the cracks. Manual processes can't keep up with the speed of modern business.
                        </p>
                    </ScrollRevealSubheading>
                </div>

                <motion.div
                    ref={ref}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={prefersReducedMotion ? {} : containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
                    {problems.map((item, idx) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={idx}
                                variants={prefersReducedMotion ? {} : cardVariants}
                                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-md transition-all duration-300"
                                whileHover={prefersReducedMotion ? {} : {
                                    y: -4,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                                }}
                            >
                                {/* Icon container */}
                                <motion.div
                                    className="inline-flex p-3 rounded-lg mb-4"
                                    style={{
                                        background: 'rgba(255, 59, 48, 0.10)'
                                    }}
                                    whileHover={prefersReducedMotion ? {} : {
                                        background: 'rgba(255, 59, 48, 0.15)'
                                    }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <Icon className="w-5 h-5 text-red-500" />
                                </motion.div>

                                {/* Card title */}
                                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                    {item.title}
                                </h3>

                                {/* Card description */}
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </SectionWrapper>
    );
};

export default WhySalesPal;

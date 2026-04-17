import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { Shield, Cpu, Users } from 'lucide-react';
import { trustLogos } from '../../../data/homepageData';
import { ScrollRevealHeading, ScrollRevealSubheading } from '../../../components/animations/ScrollReveal';
import useScrollReveal from '../../../hooks/useScrollReveal';
import useReducedMotion from '../../../hooks/useReducedMotion';

const TrustSection = () => {
    const { ref: logosRef, isVisible: logosVisible } = useScrollReveal({ threshold: 0.1 });
    const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal({ threshold: 0.1 });
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

    const trustFeatures = [
        {
            icon: Shield,
            title: "GDPR Compliant",
            description: "Enterprise-grade security & data encryption"
        },
        {
            icon: Cpu,
            title: "Unlimited Conversations",
            description: "Handle millions of leads simultaneously"
        },
        {
            icon: Users,
            title: "AI + Human Synergy",
            description: "Perfect blend for complex revenue operations"
        }
    ];

    return (
        <SectionWrapper>
            <div className="text-center mb-12">
                <ScrollRevealHeading>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Forward-Thinking Businesses</h2>
                </ScrollRevealHeading>
                <ScrollRevealSubheading>
                    <p className="text-[#A8B3BD]">Join hundreds of companies that have automated their revenue operations with AI.</p>
                </ScrollRevealSubheading>
            </div>

            {/* Trust Logos */}
            <motion.div
                ref={logosRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-16"
                variants={prefersReducedMotion ? {} : containerVariants}
                initial="hidden"
                animate={logosVisible ? "visible" : "hidden"}
            >
                {trustLogos.map((logo, idx) => (
                    <motion.div
                        key={idx}
                        className="h-16 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5"
                        variants={prefersReducedMotion ? {} : itemVariants}
                    >
                        <span className="font-bold text-xl">{logo.name}</span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Feature Cards */}
            <motion.div
                ref={cardsRef}
                className="grid md:grid-cols-3 gap-6"
                variants={prefersReducedMotion ? {} : containerVariants}
                initial="hidden"
                animate={cardsVisible ? "visible" : "hidden"}
            >
                {trustFeatures.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10"
                        variants={prefersReducedMotion ? {} : itemVariants}
                        whileHover={prefersReducedMotion ? {} : {
                            y: -6,
                            scale: 1.01,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
                            transition: {
                                duration: 0.25,
                                ease: [0.22, 1, 0.36, 1]
                            }
                        }}
                    >
                        <motion.div
                            className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4"
                            whileHover={prefersReducedMotion ? {} : {
                                scale: 1.06,
                                rotate: 2,
                                boxShadow: '0px 10px 24px rgba(118, 247, 197, 0.4)',
                                transition: {
                                    duration: 0.2,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                        >
                            <feature.icon className="w-6 h-6 text-primary" />
                        </motion.div>
                        <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                        <p className="text-[#7C8A96] text-sm">{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </SectionWrapper>
    );
};

export default TrustSection;

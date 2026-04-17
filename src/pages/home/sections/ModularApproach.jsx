import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import Badge from '../../../components/ui/Badge';
import { Layout, Zap, Shield, BarChart3, Bot } from 'lucide-react';
import { ScrollRevealHeading, ScrollRevealSubheading } from '../../../components/animations/ScrollReveal';
import useScrollReveal from '../../../hooks/useScrollReveal';
import useReducedMotion from '../../../hooks/useReducedMotion';

const ModularApproach = () => {
    const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal({ threshold: 0.1 });
    const prefersReducedMotion = useReducedMotion();

    const featureVariants = {
        hidden: {
            opacity: 0,
            x: -20
        },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
            }
        })
    };

    return (
        <SectionWrapper className="bg-white/5 border-y border-white/5">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <ScrollRevealHeading>
                        <Badge variant="outline">
                            <Layout className="w-3 h-3" /> Scalable Architecture
                        </Badge>
                    </ScrollRevealHeading>

                    <ScrollRevealHeading>
                        <h2 className="text-3xl md:text-4xl font-bold">Multi-Channel Automation, Unlimited Scalability</h2>
                    </ScrollRevealHeading>

                    <ScrollRevealSubheading>
                        <p className="text-lg text-[#A8B3BD]">
                            Engage customers wherever they are—WhatsApp, email, SMS, voice calls, and social media—all from one unified AI platform.
                            Handle 10 or 10,000 conversations simultaneously without sacrificing quality.
                        </p>
                    </ScrollRevealSubheading>

                    <div ref={featuresRef} className="flex flex-col gap-4">
                        <motion.div
                            className="flex items-center gap-4 p-4 rounded-lg bg-primary/50 border border-white/10"
                            custom={0}
                            variants={prefersReducedMotion ? {} : featureVariants}
                            initial="hidden"
                            animate={featuresVisible ? "visible" : "hidden"}
                        >
                            <Zap className="w-8 h-8 text-yellow-400" />
                            <div>
                                <h4 className="font-semibold">Human-Like AI</h4>
                                <p className="text-sm text-[#7C8A96]">Natural conversations that build trust.</p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-4 p-4 rounded-lg bg-primary/50 border border-white/10"
                            custom={1}
                            variants={prefersReducedMotion ? {} : featureVariants}
                            initial="hidden"
                            animate={featuresVisible ? "visible" : "hidden"}
                        >
                            <Shield className="w-8 h-8 text-green-400" />
                            <div>
                                <h4 className="font-semibold">24/7 Operations</h4>
                                <p className="text-sm text-[#7C8A96]">Never miss a lead, day or night.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="flex-1 w-full flex justify-center">
                    {/* Visual representation of modularity */}
                    <div className="relative w-full max-w-md aspect-square rounded-full border border-white/10 flex items-center justify-center animate-spin-slow-reverse">
                        <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-spin-slow"></div>
                        <div className="grid grid-cols-2 gap-4 p-8">
                            <div className="bg-secondary p-6 rounded-2xl w-32 h-32 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(118,247,197,0.3)] transform translate-y-4">
                                <Zap className="w-8 h-8 text-primary mb-2" />
                                <span className="text-primary font-bold text-xs">MKT</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl w-32 h-32 flex flex-col items-center justify-center border border-white/10 transform -translate-y-4">
                                <BarChart3 className="w-8 h-8 text-white mb-2" />
                                <span className="text-white font-bold text-xs">SALES</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl w-32 h-32 flex flex-col items-center justify-center border border-white/10 transform translate-y-4">
                                <Bot className="w-8 h-8 text-white mb-2" />
                                <span className="text-white font-bold text-xs">POST</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-6 rounded-2xl w-32 h-32 flex flex-col items-center justify-center border border-white/10 transform -translate-y-4">
                                <Shield className="w-8 h-8 text-white mb-2" />
                                <span className="text-white font-bold text-xs">SUP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default ModularApproach;

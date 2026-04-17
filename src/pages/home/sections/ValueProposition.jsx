import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../../../components/layout/SectionWrapper';
import { Bot, Zap, Clock, TrendingUp, Megaphone, Phone, UserCheck, Headphones } from 'lucide-react';

const ValueProposition = () => {
    const features = [
        {
            icon: Bot,
            title: "Human-like AI Agents",
            desc: "AI that talks like your best salesperson - on WhatsApp, calls, and email. No robotic responses."
        },
        {
            icon: Zap,
            title: "Instant Response",
            desc: "Respond to every lead in seconds, not hours. No lead goes cold on your watch."
        },
        {
            icon: Clock,
            title: "24×7 Availability",
            desc: "Your AI workforce never sleeps. Engage customers across time zones, any time of day."
        },
        {
            icon: TrendingUp,
            title: "Consistent Growth",
            desc: "Scale without scaling headcount. Handle 10x more leads with the same team size."
        }
    ];

    return (
        <SectionWrapper className="bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Subtle radial glow background */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Orbit Graphic */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative h-96 hidden lg:flex items-center justify-center"
                >
                    {/* White container with soft shadow */}
                    <div className="absolute inset-0 bg-white rounded-3xl shadow-lg"></div>

                    {/* Orbit container */}
                    <div className="relative w-80 h-80">
                        {/* Subtle background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl"></div>

                        {/* Dotted orbit rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200"></div>
                        </div>

                        {/* Center Bot icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                                <Bot className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Outer Orbiting icons container with rotation animation */}
                        <div className="absolute inset-0 animate-orbit">
                            {/* Top icon (Megaphone) */}
                            <div className="absolute" style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(270deg) translateX(128px) rotate(-270deg)'
                            }}>
                                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                                    <Megaphone className="w-7 h-7 text-white" />
                                </div>
                            </div>

                            {/* Bottom icon (UserCheck) */}
                            <div className="absolute" style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(90deg) translateX(128px) rotate(-90deg)'
                            }}>
                                <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                                    <UserCheck className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Inner Orbiting icons container with reverse rotation animation */}
                        <div className="absolute inset-0 animate-orbit-reverse">
                            {/* Right icon (Phone) */}
                            <div className="absolute" style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(0deg) translateX(96px) rotate(0deg)'
                            }}>
                                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                                    <Phone className="w-7 h-7 text-white" />
                                </div>
                            </div>

                            {/* Left icon (Headphones) */}
                            <div className="absolute" style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(180deg) translateX(96px) rotate(-180deg)'
                            }}>
                                <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                                    <Headphones className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right side - Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                        AI That Actually <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">Does The Work</span>
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        SalesPal isn't just another chatbot. It's a complete AI workforce that handles your marketing, sales, and support - just like your best employees would.
                    </p>

                    {/* 2x2 Feature grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="p-3 bg-blue-50 w-fit rounded-lg">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes orbit {
                    0% {
                        transform: rotate(360deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }
                @keyframes orbit-reverse {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .animate-orbit {
                    animation: orbit 20s linear infinite;
                }
                .animate-orbit-reverse {
                    animation: orbit-reverse 20s linear infinite;
                }
            `}</style>
        </SectionWrapper >
    );
};

export default ValueProposition;

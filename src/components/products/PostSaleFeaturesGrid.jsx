import React, { useEffect, useRef, useState } from 'react';
import { Bot, Activity, Users, TrendingUp, Star, Shield } from 'lucide-react';

const features = [
    {
        icon: Bot,
        title: "Automated Onboarding",
        description: "Guide new customers through setup with personalized AI-driven onboarding sequences."
    },
    {
        icon: Activity,
        title: "Engagement Tracking",
        description: "Monitor customer health scores and get alerts when engagement drops."
    },
    {
        icon: Users,
        title: "Proactive Outreach",
        description: "AI reaches out to customers at key milestones to ensure satisfaction."
    },
    {
        icon: TrendingUp,
        title: "Upsell Detection",
        description: "Identify customers ready for upgrades based on usage patterns and behavior."
    },
    {
        icon: Star,
        title: "Review Collection",
        description: "Automatically request reviews and testimonials at the right moment."
    },
    {
        icon: Shield,
        title: "Churn Prevention",
        description: "Early warning system for at-risk customers with automated intervention."
    }
];

const PostSaleFeaturesGrid = () => {
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
            id="powerful-features"
            ref={sectionRef}
            className="py-20 px-6 bg-white"
            style={{ scrollMarginTop: '80px' }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        Powerful Features
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to automate and scale your revenue operations.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`p-6 bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isVisible ? 'animate-fade-in-stagger' : 'opacity-0'
                                    }`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    boxShadow: '0px 4px 12px rgba(0,0,0,0.08)'
                                }}
                            >
                                {/* Icon Container */}
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.1)'
                                    }}
                                >
                                    <Icon className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes fadeInStagger {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-stagger {
                    animation: fadeInStagger 0.6s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default PostSaleFeaturesGrid;

import { BarChart3, Users, Phone, Cpu, Zap, Bot, CheckCircle2, Shield, Layout, TrendingDown, UserX, DollarSign, AlertTriangle, Clock, XCircle, Megaphone, UserCheck, Headphones } from 'lucide-react';

export const problems = [
    {
        icon: Clock,
        title: "Leads Go Cold",
        desc: "Delayed responses mean lost opportunities. By the time you call back, they've moved on.",
        color: "text-red-500"
    },
    {
        icon: XCircle,
        title: "Missed Follow-ups",
        desc: "Your team can't keep track of every lead. 80% of sales require 5+ follow-ups.",
        color: "text-red-500"
    },
    {
        icon: UserX,
        title: "High Team Costs",
        desc: "Hiring salespeople, marketers, and support staff is expensive and hard to scale.",
        color: "text-red-500"
    },
    {
        icon: TrendingDown,
        title: "Revenue Leaks",
        desc: "Poor post-sales engagement means churn. Customers leave before they become advocates.",
        color: "text-red-500"
    }
];

export const modules = [
    {
        id: "marketing",
        title: "SalesPal Marketing",
        subtitle: "AI-Powered Content & Campaigns",
        description: "AI creates ad creatives, videos, carousels, and captions. Schedule posts across platforms - all on autopilot.",
        icon: Megaphone,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/20",
        features: [
            "20 AI image creatives / month",
            "4 AI videos (≥30 sec) / month",
            "6 AI carousel creatives / month",
            "30 scheduled posts / month",
            "AI ad copy & captions",
            "Multi-platform publishing"
        ]
    },
    {
        id: "sales",
        title: "SalesPal Sales",
        subtitle: "Human-like Conversations",
        description: "Human-like WhatsApp & Voice conversations that qualify leads, handle objections, and book meetings automatically.",
        icon: Phone,
        iconColor: "text-green-400",
        iconBg: "bg-green-500/20",
        features: [
            "1000 AI calling minutes / month",
            "1000 WhatsApp conversations / month",
            "AI outbound & inbound calling",
            "AI WhatsApp replies",
            "Follow-up & re-scheduling logic",
            "Context memory",
            "Human escalation when needed"
        ]
    },
    {
        id: "postsale",
        title: "SalesPal Post-Sale",
        subtitle: "Automated Payment & Document Collection",
        description: "Automated payment reminders, proof collection, document checklists, and owner-verified closure workflows.",
        icon: UserCheck,
        iconColor: "text-yellow-400",
        iconBg: "bg-yellow-500/20",
        features: [
            "1000 AI calling minutes / month",
            "1000 WhatsApp conversations / month",
            "Automated payment reminders",
            "Payment proof collection",
            "Owner verified closure",
            "Document checklist & re-upload",
            "Full audit log"
        ]
    },
    {
        id: "support",
        title: "SalesPal Support",
        subtitle: "AI-Powered Customer Support",
        description: "24/7 AI support with sentiment detection, knowledge-based answers, and smart escalation when needed.",
        icon: Headphones,
        iconColor: "text-red-400",
        iconBg: "bg-red-500/20",
        features: [
            "1000 AI calling minutes / month",
            "1000 WhatsApp conversations / month",
            "AI answers from your knowledge",
            "No hallucination (escalates if unsure)",
            "Call diversion ON/OFF",
            "Complaint registration with ID",
            "Sentiment detection"
        ]
    }
];

export const plans = [
    {
        title: "Growth Starter",
        price: 9999,
        features: [
            "AI Business Analysis",
            "Basic Ad Creation",
            "1 Platform Connection",
            "Email support"
        ],
        ctaText: "Start Free Trial",
        isPopular: false
    },
    {
        title: "Business Pro",
        price: 24999,
        features: [
            "Advanced Market Analysis",
            "Unlimited Ad Variations",
            "3 Platform Connections",
            "Budget Optimization AI",
            "Priority support"
        ],
        ctaText: "Start Free Trial",
        isPopular: true,
        isMint: true
    },
    {
        title: "Enterprise Scale",
        price: 39999,
        features: [
            "Full AI Suite",
            "Custom API Access",
            "Unlimited Connections",
            "Dedicated Account Manager",
            "SLA Guarantees"
        ],
        ctaText: "Contact Sales",
        isPopular: false
    }
];

export const steps = [
    {
        number: "01",
        title: "Connect Your Channels",
        description: "Link your WhatsApp Business, email, CRM, and other communication channels in just a few clicks. Our guided setup takes less than 10 minutes."
    },
    {
        number: "02",
        title: "Train Your AI Agent",
        description: "Upload your product information, FAQs, and sales scripts. Our AI learns your brand voice and business rules to represent you perfectly."
    },
    {
        number: "03",
        title: "Launch & Automate",
        description: "Activate your AI workforce and watch it engage leads, qualify prospects, and close deals automatically—24 hours a day, 7 days a week."
    },
    {
        number: "04",
        title: "Optimize & Scale",
        description: "Monitor performance through real-time analytics, refine your strategies with A/B testing, and scale effortlessly as your business grows."
    }
];

export const trustLogos = [
    { name: "LODHA" },
    { name: "GODREJ" },
    { name: "MAHINDRA" },
    { name: "DLF" }
];

export const comparisonPoints = [
    {
        title: "Response Time",
        traditional: "Hours or days to follow up",
        salespal: "Instant 24/7 engagement"
    },
    {
        title: "Lead Handling",
        traditional: "Limited by team capacity",
        salespal: "Unlimited concurrent conversations"
    },
    {
        title: "Personalization",
        traditional: "Generic templates",
        salespal: "Context-aware AI responses"
    },
    {
        title: "Scalability",
        traditional: "Hire and train more staff",
        salespal: "Scale instantly with AI"
    },
    {
        title: "Implementation",
        traditional: "Weeks of onboarding",
        salespal: "Live in under 10 minutes"
    }
];

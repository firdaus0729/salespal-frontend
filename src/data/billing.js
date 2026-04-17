import { Zap, ShoppingCart, FileText, Phone, MessageSquare, Image, Video, Layers, BarChart3, Bot, Globe } from 'lucide-react';

export const PLANS = [
    {
        id: 'marketing',
        name: 'SalesPal Marketing',
        subtitle: 'Growth & Social Engagement',
        price: 5999,
        features: ['AI Content Generation', 'Auto-posting', 'Basic Analytics'],
        color: 'blue',
        tier: 1,
        type: 'subscription',
        icon: Zap
    },
    {
        id: 'sales',
        name: 'SalesPal Sales',
        subtitle: 'Lead Gen & Conversion',
        price: 9999,
        features: ['Lead Qualification', 'CRM Integration', 'Email Sequences'],
        color: 'green',
        tier: 2,
        type: 'subscription',
        icon: ShoppingCart
    },
    {
        id: 'postsale',
        name: 'SalesPal Post-Sale',
        subtitle: 'Retention & Success',
        price: 9999,
        features: ['Customer Onboarding', 'Feedback Loops', 'Upsell Triggers'],
        color: 'purple',
        tier: 2,
        type: 'subscription',
        icon: FileText
    },
    {
        id: 'support',
        name: 'SalesPal Support',
        subtitle: 'Automated Assistance',
        price: 9999,
        features: ['24/7 AI Chatbot', 'Ticket Routing', 'Knowledge Base'],
        color: 'orange',
        tier: 2,
        type: 'subscription',
        icon: Bot
    },
    {
        id: 'salespal360',
        name: 'SalesPal 360',
        subtitle: 'Flagship All-in-One Suite',
        price: 29999,
        features: [
            'All 4 products included',
            '3000 AI calling minutes/month',
            '3000 WhatsApp convs/month',
            'Shared AI Intelligence',
            'Master Business Controls',
            'Dedicated Account Manager',
            '24/7 Priority Support',
            'Custom API Access'
        ],
        color: 'blue',
        tier: 3,
        type: 'subscription',
        icon: Globe,
        isFlagship: true
    }
];

export const TOP_UPS = [
    { id: 'mins', name: 'AI Calling Minutes', subtitle: 'Global voice credits', quantity: '200 Mins', price: 999, icon: Phone, type: 'topup' },
    { id: 'whatsapp', name: 'WhatsApp Conversations', subtitle: 'Broadcasting credits', quantity: '200 Convs', price: 1499, icon: MessageSquare, type: 'topup' },
    { id: 'images', name: 'AI Images', subtitle: 'Production-ready assets', quantity: '10 Images', price: 499, icon: Image, type: 'topup' },
    { id: 'carousels', name: 'AI Carousels', subtitle: 'Dynamic social slides', quantity: '5 Carousels', price: 799, icon: Layers, type: 'topup' },
    { id: 'videos', name: 'AI Videos', subtitle: 'High-impact shorts', quantity: '2 Videos', price: 999, subtext: '≤30 sec', icon: Video, type: 'topup' }
];

export const FEATURES = [
    {
        id: 'adv_analytics',
        name: 'Advanced Analytics',
        description: 'Deep-dive ROI tracking and custom reporting dashboards.',
        price: 2499,
        icon: BarChart3,
        type: 'addon',
        compatibleWith: ['marketing', 'sales']
    },
    {
        id: 'automation_plus',
        name: 'Automation Pro',
        description: 'Multi-step cross-platform automation workflows.',
        price: 1999,
        icon: Bot,
        type: 'addon',
        compatibleWith: ['postsale', 'sales']
    }
];

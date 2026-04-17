import { LayoutDashboard, Megaphone, BarChart3, Settings, Share2, CreditCard } from 'lucide-react';

export const marketingNav = [
    {
        name: 'Dashboard',
        path: '/marketing',
        icon: LayoutDashboard
    },
    {
        name: 'Projects',
        path: '/marketing/projects',
        icon: Megaphone
    },
    {
        name: 'Social',
        path: '/marketing/social',
        icon: Share2
    },
    {
        name: 'Subscription',
        path: '/marketing/subscription',
        icon: CreditCard
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings
    }
];

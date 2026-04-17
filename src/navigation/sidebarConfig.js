import { LayoutGrid, Zap, BarChart3, Bot } from 'lucide-react';

export const sidebarConfig = [
    {
        label: "Overview",
        route: "/dashboard",
        icon: LayoutGrid,
        alwaysVisible: true
    },
    {
        label: "Marketing",
        route: "/dashboard/marketing",
        icon: Zap,
        module: "marketing"
    },
    {
        label: "Sales",
        route: "/dashboard/sales",
        icon: BarChart3,
        module: "sales"
    },
    {
        label: "Support",
        route: "/dashboard/support",
        icon: Bot,
        module: "support"
    }
];

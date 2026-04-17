import { Users, TrendingUp, Target } from 'lucide-react';
import { usePreferences } from '../../../../context/PreferencesContext';
import CurrencyIcon from '../../../../components/ui/CurrencyIcon';

export default function CampaignOverview({ campaign }) {
    const { dailyBudget, leads, totalSpend, cpl } = campaign || {};
    const { formatCurrency } = usePreferences();

    // Helper: if value is a number format it; if it's a pre-formatted string pass through; else show zero
    const fmtMoney = (val) => {
        if (val === null || val === undefined) return formatCurrency(0);
        if (typeof val === 'number') return formatCurrency(val);
        // Pre-formatted string (e.g. "₹5,000") — extract number and reformat
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? formatCurrency(0) : formatCurrency(num);
    };

    const metrics = [
        {
            label: 'Daily Budget',
            value: fmtMoney(dailyBudget),
            icon: CurrencyIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Leads Generated',
            value: leads || '0',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Spend So Far',
            value: fmtMoney(totalSpend),
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            label: 'Cost Per Lead',
            value: fmtMoney(cpl),
            icon: Target,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${metric.bg}`}>
                                <Icon className={`w-5 h-5 ${metric.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

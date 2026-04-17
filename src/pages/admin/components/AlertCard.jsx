import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';

const alertConfig = {
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconColor: 'text-amber-500',
        textColor: 'text-amber-800',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-50',
        border: 'border-red-200',
        iconColor: 'text-red-500',
        textColor: 'text-red-800',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-800',
    },
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconColor: 'text-emerald-500',
        textColor: 'text-emerald-800',
    },
};

const AlertCard = ({ alerts = [] }) => {
    return (
        <div className="space-y-3">
            {alerts.map((alert, index) => {
                const config = alertConfig[alert.type] || alertConfig.info;
                const Icon = config.icon;
                return (
                    <div
                        key={index}
                        className={`flex items-start gap-3 p-3 ${config.bg} border ${config.border} rounded-lg`}
                    >
                        <Icon size={15} className={`${config.iconColor} shrink-0 mt-0.5`} />
                        <div>
                            <p className={`text-sm font-medium ${config.textColor}`}>{alert.message}</p>
                            {alert.time && (
                                <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertCard;

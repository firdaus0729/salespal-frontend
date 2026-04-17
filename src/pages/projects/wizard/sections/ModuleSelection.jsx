import React from 'react';
import ModuleCard from './ModuleCard';
import { Zap, BarChart3, Bot } from 'lucide-react';

const ModuleSelection = ({ selectedModules, toggleModule }) => {
    const modules = [
        {
            id: 'marketing',
            title: 'Marketing',
            description: 'AI-powered campaign creation and lead generation',
            icon: Zap
        },
        {
            id: 'sales',
            title: 'Sales',
            description: 'AI calling, WhatsApp follow-ups, lead conversion',
            icon: BarChart3
        },
        {
            id: 'support',
            title: 'Support',
            description: 'AI voice & chat support with escalation',
            icon: Bot
        }
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Select Required Modules</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {modules.map(module => (
                    <ModuleCard
                        key={module.id}
                        {...module}
                        isSelected={selectedModules.includes(module.id)}
                        onSelect={toggleModule}
                    />
                ))}
            </div>
            {selectedModules.length === 0 && (
                <p className="text-red-400 text-sm mt-3 animate-pulse">Please select at least one module.</p>
            )}
        </div>
    );
};

export default ModuleSelection;

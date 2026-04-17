import React from 'react';
import StepHeader from '../components/StepHeader';
import ModuleSelectCard from '../components/ModuleSelectCard';
import { Zap, BarChart3, Bot } from 'lucide-react';

const StepModuleSelect = ({ projectData, updateData }) => {
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

    const handleToggle = (id) => {
        const current = projectData.modules;
        const updated = current.includes(id)
            ? current.filter(m => m !== id)
            : [...current, id];
        updateData('modules', updated);
    };

    return (
        <div className="max-w-4xl">
            <StepHeader
                title="Select Modules"
                description="Choose the AI capabilities you need for this project."
            />

            <div className="grid md:grid-cols-3 gap-6">
                {modules.map(module => (
                    <ModuleSelectCard
                        key={module.id}
                        {...module}
                        isSelected={projectData.modules.includes(module.id)}
                        onToggle={handleToggle}
                    />
                ))}
            </div>

            {projectData.modules.length === 0 && (
                <p className="text-red-400 text-sm mt-4 animate-pulse">At least one module is required.</p>
            )}
        </div>
    );
};

export default StepModuleSelect;

import React from 'react';
import AIActionCard from './AIActionCard';

export default function AIActionList({ actions, onApplyAction, appliedActions = [] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action, index) => (
                <AIActionCard
                    key={index}
                    action={action}
                    onApply={onApplyAction}
                    isApplied={appliedActions.includes(action.type)}
                />
            ))}
        </div>
    );
}

import React from 'react';
import ModulePage from '../ModulePage';
import { Bot } from 'lucide-react';

const Support = () => {
    return (
        <ModulePage
            title="Customer Support"
            description="AI voice & chat support with smart escalation."
            icon={Bot}
        />
    );
};

export default Support;

import React from 'react';
import ModulePage from '../ModulePage';
import { Zap } from 'lucide-react';

const Marketing = () => {
    return (
        <ModulePage
            title="Marketing Intelligence"
            description="AI-powered campaign creation and lead generation."
            icon={Zap}
        />
    );
};

export default Marketing;
